import { Request, Response } from "express";

import { adminService } from "../../services/admins/auth.service";
import { IAdmin } from "../../types/admins/admins.type";
import { IRegisterAccount } from "../../types/admins/register-account.type";
import { LoginAccountDto } from "../../dtos/admin/admin.dto";
import { RegisterAccountDto } from "../../dtos/admin/admin.dto";
import { handleErrorDto } from "../../utils/handle_error_dto.util";
import { ResponseType } from "../../types/response.type";
import { configService } from "../../configs/configService.config";

export class AdminController {
    async getAdmins(req: Request, res: Response): Promise<IAdmin[] | any> {
        try {
            const data = await adminService.getAdmins();
            return res.status(200).json({
                message: "Get Admin Accounts successfully!",
                data,
            });
        } catch (err) {
            return res.status(500).json({
                message: "Internal Server Error",
                err,
            });
        }
    }

    async register(req: Request, res: Response): Promise<any> {
        try {
            const { username, password, phone_number, role }: IRegisterAccount =
                req.body;

            // validate dữ liệu đầu vào nhờ DTO
            const errorResult: ResponseType<any> = await handleErrorDto<{
                username: string;
                password: string;
                phone_number: string;
                role: string;
            }>(
                { username, password, phone_number, role },
                new RegisterAccountDto()
            );

            if (errorResult.statusCode) {
                return res.status(errorResult.statusCode).json(errorResult);
            }

            const data = await adminService.registerAccount({
                username,
                password,
                phone_number,
                role,
            });
            return res.status(data.statusCode).json(data);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                err,
            });
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        try {
            const { username, password } = req.body;

            // validate dữ liệu đầu vào nhờ DTO
            const errorResult: ResponseType<any> = await handleErrorDto<{
                username: string;
                password: string;
            }>({ username, password }, new LoginAccountDto());

            if (errorResult.statusCode) {
                return res.status(errorResult.statusCode).json(errorResult);
            }

            const data = await adminService.loginAccount({
                username,
                password,
            });

            return res.status(data.statusCode).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ err: err });
        }
    }

    refreshToken(req: Request, res: Response) {
        let refresh_token: string = req.headers["authorization"] as string;

        if (refresh_token.startsWith("Bearer ")) {
            refresh_token = refresh_token.slice(7, refresh_token.length);
        }

        if (!refresh_token) {
            return res.status(403).json({
                statusCode: 403,
                message: "Refresh token not valid",
            });
        }

        try {
            const data = adminService.refreshTokenService(refresh_token);

            res.status(data.statusCode).json(data);
        } catch (err) {
            res.status(400).json({
                error: err,
            });
        }
    }

    logout(req: Request, res: Response) {
        try {
            // res.clearCookie("access_token");
            // res.clearCookie("refresh_token");

            return res.status(200).json({
                statusCode: 200,
                message: "Logout successfully",
            });
        } catch (err) {
            return res.status(500).json({
                statusCode: 500,
                message: err,
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<any> {
        try {
            const { admin_id } = res.locals.data;
            const data = await adminService.getProfile(admin_id);

            return res.status(data.statusCode).json(data);
        } catch (err) {
            res.status(500).json({
                statusCode: 500,
                message: err,
            });
        }
    }
}
