import { BaseService } from "./base.service";

class ProductService extends BaseService {
    async listProducts(offset: number, limit: number) {
        try {
            const res = await this.httpClientPublic.get(
                `/product/view?page=${offset}&limit=${limit}`
            );

            return res.data;
        } catch (error) {
            return error;
        }
    }

    async getProductByTitle(title: string, page: number, limit: number) {
        try {
            const res = await this.httpClientPublic.get(
                `/product/search?title=${title}&page=${page}&limit=${limit}`
            );

            return res.data;
        } catch (error) {
            return error;
        }
    }

    async getProductById(product_id: number) {
        try {
            const res = await this.httpClientPublic.get(
                `/product/${product_id}/view`
            );

            return res.data;
        } catch (error) {
            return error;
        }
    }

    async getPhotoProductById(product_id: number) {
        try {
            const res = await this.httpClientPublic.get(
                `/product/${product_id}/product_photo/view`
            );

            return res.data;
        } catch (error) {
            return error;
        }
    }

    async updateProductById(product: any) {
        try {
            const res = await this.httpClientPublic.patch(
                `/product/update`,
                product
            );

            return res.data;
        } catch (error) {
            return error;
        }
    }
}

export const productService: ProductService = new ProductService();
