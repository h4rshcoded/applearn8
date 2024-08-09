// pages/api/login/route.js

import { NextResponse } from "next/server";
import pool from "@/app/libs/mysql";
import bcrypt from "bcrypt";
import { login } from "@/utils/auth";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const db = await pool.getConnection();
        const query = "SELECT * FROM Users WHERE Email = ?";
        const [rows] = await db.execute(query, [email]);
        db.release();

        if (rows.length === 0) {
            return NextResponse.json({
                message: "User Not Found"
            }, {
                status: 401,
            });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return NextResponse.json({
                message: "Invalid Password"
            }, {
                status: 401,
            });
        }
        await login(user.username, user.Email, user.FirstName, user.LastName, user.RollNumber);        

        return NextResponse.json({
            message: "Login Successful",
        }, {
            status: 200,
        });
    } catch (error) {
        // console.log(error);
        return NextResponse.json({
            message: "Error Occured",
            error: error
        }, {
            status: 501,
        });
    }
}
