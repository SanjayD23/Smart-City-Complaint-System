import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDepartments = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        res.json({ departments: result.rows });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Server error fetching departments' });
    }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const result = await pool.query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || null]
        );

        res.status(201).json({
            message: 'Department created successfully',
            department: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Department already exists' });
        }
        console.error('Create department error:', error);
        res.status(500).json({ error: 'Server error creating department' });
    }
};

export const getOfficersByDepartment = async (req: AuthRequest, res: Response) => {
    const departmentId = req.params.departmentId;

    try {
        const result = await pool.query(
            'SELECT id, name, email FROM users WHERE role = $1 AND department_id = $2',
            ['officer', departmentId]
        );

        res.json({ officers: result.rows });
    } catch (error) {
        console.error('Get officers error:', error);
        res.status(500).json({ error: 'Server error fetching officers' });
    }
};
