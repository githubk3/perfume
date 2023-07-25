import { Response, Request, Express } from "express";
import { uploadService } from "../../utils/upload_file_cloudinary.util";

export class UploadController {
    async uploadImage(req: Request, res: Response): Promise<any> {
        try {
            const filePath: string = req.file?.path as string;

            const data = await uploadService.uploadImage(filePath);

            return res.status(200).json({
                statusCode: 200,
                message: "Upload file successfull",
                data: data,
            });
        } catch (err) {
            return {
                statusCode: 500,
                message: "Internal Server Error",
            };
        }
    }

    async destroyImageByPublicId(req: Request, res: Response): Promise<any> {
        try {
            const public_id = req.body.public_id;

            const data = await uploadService.destroyImage(public_id);

            return res.status(200).json({
                statusCode: 200,
                message: "Destroy file from cloudinary successfull",
                data: data,
            });
        } catch (err) {
            return {
                statusCode: 500,
                message: "Internal Server Error",
            };
        }
    }
}
