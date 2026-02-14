import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/email.service';

export const createComplaint = async (req: AuthRequest, res: Response) => {
    const { title, description, latitude, longitude } = req.body;
    const citizenId = req.user!.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const result = await pool.query(
            `INSERT INTO complaints (citizen_id, title, description, image_url, latitude, longitude, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
            [citizenId, title, description, imageUrl, latitude || null, longitude || null]
        );

        const complaint = result.rows[0];

        // Send confirmation email to citizen
        const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [citizenId]);
        const user = userResult.rows[0];

        await sendEmail(
            user.email,
            'Complaint Registered Successfully',
            `Dear ${user.name},\n\nYour complaint has been registered successfully.\n\nComplaint ID: ${complaint.id}\nTitle: ${complaint.title}\nStatus: Pending\n\nWe will notify you once it is assigned to a department.\n\nThank you for using Smart City Complaint System.`
        );

        res.status(201).json({
            message: 'Complaint created successfully',
            complaint
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ error: 'Server error creating complaint' });
    }
};

export const getComplaints = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    try {
        let query = '';
        let params: any[] = [];

        if (userRole === 'citizen') {
            query = `
        SELECT c.*, d.name as department_name, u.name as officer_name 
        FROM complaints c 
        LEFT JOIN departments d ON c.department_id = d.id 
        LEFT JOIN users u ON c.officer_id = u.id 
        WHERE c.citizen_id = $1 
        ORDER BY c.created_at DESC
      `;
            params = [userId];
        } else if (userRole === 'officer') {
            query = `
        SELECT c.*, d.name as department_name, u.name as citizen_name, u.email as citizen_email 
        FROM complaints c 
        LEFT JOIN departments d ON c.department_id = d.id 
        LEFT JOIN users u ON c.citizen_id = u.id 
        WHERE c.officer_id = $1 
        ORDER BY c.created_at DESC
      `;
            params = [userId];
        } else if (userRole === 'admin') {
            query = `
        SELECT c.*, d.name as department_name, u.name as citizen_name, 
               u.email as citizen_email, o.name as officer_name 
        FROM complaints c 
        LEFT JOIN departments d ON c.department_id = d.id 
        LEFT JOIN users u ON c.citizen_id = u.id 
        LEFT JOIN users o ON c.officer_id = o.id 
        ORDER BY c.created_at DESC
      `;
        }

        const result = await pool.query(query, params);
        res.json({ complaints: result.rows });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ error: 'Server error fetching complaints' });
    }
};

export const getComplaintById = async (req: AuthRequest, res: Response) => {
    const complaintId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name, 
              u.name as citizen_name, u.email as citizen_email,
              o.name as officer_name, o.email as officer_email
       FROM complaints c 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u ON c.citizen_id = u.id 
       LEFT JOIN users o ON c.officer_id = o.id 
       WHERE c.id = $1`,
            [complaintId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Get complaint updates
        const updatesResult = await pool.query(
            `SELECT cu.*, u.name as officer_name 
       FROM complaint_updates cu 
       LEFT JOIN users u ON cu.officer_id = u.id 
       WHERE cu.complaint_id = $1 
       ORDER BY cu.created_at DESC`,
            [complaintId]
        );

        res.json({
            complaint: result.rows[0],
            updates: updatesResult.rows
        });
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({ error: 'Server error fetching complaint' });
    }
};

export const assignComplaint = async (req: AuthRequest, res: Response) => {
    const complaintId = req.params.id;
    const { departmentId, officerId } = req.body;

    try {
        if (!departmentId) {
            return res.status(400).json({ error: 'Department ID is required' });
        }

        const result = await pool.query(
            `UPDATE complaints 
       SET department_id = $1, officer_id = $2, status = 'assigned', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
            [departmentId, officerId || null, complaintId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const complaint = result.rows[0];

        // Add update record
        await pool.query(
            'INSERT INTO complaint_updates (complaint_id, officer_id, status, comment) VALUES ($1, $2, $3, $4)',
            [complaintId, req.user!.id, 'assigned', 'Complaint assigned to department']
        );

        // Send email to officer if assigned
        if (officerId) {
            const officerResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [officerId]);
            if (officerResult.rows.length > 0) {
                const officer = officerResult.rows[0];
                await sendEmail(
                    officer.email,
                    'New Complaint Assigned',
                    `Dear ${officer.name},\n\nA new complaint has been assigned to you.\n\nComplaint ID: ${complaint.id}\nTitle: ${complaint.title}\nDescription: ${complaint.description}\n\nPlease log in to the system to view and update the complaint.\n\nThank you.`
                );
            }
        }

        // Send email to citizen
        const citizenResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [complaint.citizen_id]);
        if (citizenResult.rows.length > 0) {
            const citizen = citizenResult.rows[0];
            await sendEmail(
                citizen.email,
                'Complaint Assigned to Department',
                `Dear ${citizen.name},\n\nYour complaint has been assigned to a department.\n\nComplaint ID: ${complaint.id}\nTitle: ${complaint.title}\nStatus: Assigned\n\nYou will be notified of further updates.\n\nThank you.`
            );
        }

        res.json({
            message: 'Complaint assigned successfully',
            complaint
        });
    } catch (error) {
        console.error('Assign complaint error:', error);
        res.status(500).json({ error: 'Server error assigning complaint' });
    }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
    const complaintId = req.params.id;
    const { status, comment } = req.body;
    const officerId = req.user!.id;

    try {
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['assigned', 'in_progress', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE complaints 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [status, complaintId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const complaint = result.rows[0];

        // Add update record
        await pool.query(
            'INSERT INTO complaint_updates (complaint_id, officer_id, status, comment) VALUES ($1, $2, $3, $4)',
            [complaintId, officerId, status, comment || null]
        );

        // Send email to citizen
        const citizenResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [complaint.citizen_id]);
        if (citizenResult.rows.length > 0) {
            const citizen = citizenResult.rows[0];
            await sendEmail(
                citizen.email,
                'Complaint Status Updated',
                `Dear ${citizen.name},\n\nYour complaint status has been updated.\n\nComplaint ID: ${complaint.id}\nTitle: ${complaint.title}\nNew Status: ${status.replace('_', ' ').toUpperCase()}\n${comment ? `\nComment: ${comment}` : ''}\n\nThank you for your patience.\n\nSmart City Complaint System`
            );
        }

        res.json({
            message: 'Complaint status updated successfully',
            complaint
        });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ error: 'Server error updating complaint' });
    }
};
