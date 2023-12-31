import { query } from "../../db/index.db";
import { HttpStatusCode } from "../../configs/httpStatusCode.config";
import { ProductType } from "../../types/products/product.type";
import { ResponseType } from "../../types/response.type";
import { PhotoType } from "../../types/products/product.type";

class ProductService {
    // list in admin page
    async listProducts(
        page: number,
        limit: number
    ): Promise<ResponseType<any>> {
        //limit = 10, page 1: => offset = 0,
        // page 2: offset = (page-1)*limit
        const totalProducts = await this.countProducts();
        const offset = (page - 1) * limit;
        const results = await query(
            `SELECT product_id, category_name, title, description , brand, year_publish, 
            volume, price, discount, quantity, created_at
            FROM products JOIN categories using(category_id) OFFSET $1 LIMIT $2`,
            [offset, limit]
        );

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get products successfully",
            data: {
                products: results.rows,
                page: page,
                total: limit,
                totalPage: Math.ceil(totalProducts / limit),
                totalProducts,
            },
        };
    }

    async getProductByCateId(
        category_id: number,
        page: number,
        limit: number
    ): Promise<ResponseType<any>> {
        const offset = (page - 1) * limit;

        const results = await query(
            `SELECT product_id, title, price, discount, volume, brand, year_publish, description 
            FROM products  JOIN categories USING(category_id)
            WHERE category_id = $1 
            OFFSET $2 LIMIT $3`,
            [category_id, offset, limit]
        );

        const totalProductRes = await query(
            `SELECT count(*) as total_product FROM products WHERE category_id = $1`,
            [category_id]
        );

        const totalProduct = Number(totalProductRes.rows[0].total_product);

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get Products Success",
            data: {
                products: results.rows,
                page: page,
                total: limit,
                totalPage: Math.ceil(totalProduct / limit),
                totalProduct,
            },
        };
    }

    async getAllBrand(): Promise<ResponseType<string[]>> {
        const results = await query(`SELECT distinct brand FROM products`);

        if (!results.rows.length) {
            return {
                statusCode: HttpStatusCode.NOT_FOUND,
                message: "Brand Not Found",
            };
        }

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get All Brand Success",
            data: results.rows,
        };
    }

    async getProductPhotoById(
        product_id: number
    ): Promise<ResponseType<ProductType[]>> {
        const results = await query(
            `SELECT product_photo_id, product_photo_url FROM product_photos 
            WHERE product_id = $1 `,
            [product_id]
        );

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get Product Photo Success",
            data: results.rows,
        };
    }

    async getProductById(
        product_id: number
    ): Promise<ResponseType<ProductType>> {
        const results = await query(
            `SELECT * FROM products WHERE product_id = $1`,
            [product_id]
        );

        if (!results.rows.length) {
            return {
                statusCode: HttpStatusCode.NOT_FOUND,
                message: "Product not found",
            };
        }

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get Product Success",
            data: results.rows[0],
        };
    }

    async getProductByTitle(
        title: string,
        page: number,
        limit: number
    ): Promise<ResponseType<any>> {
        //limit = 10, page 1: => offset = 0,
        // page 2: offset = (page-1)*limit
        const totalProducts = await query(
            `SELECT count(product_id) number_of_products
            FROM products WHERE title ILIKE '%' || $1 || '%'`,
            [title]
        );

        const offset = (page - 1) * limit;
        const results = await query(
            `SELECT product_id, category_name, title, description , brand, year_publish, 
            volume, price, discount, quantity, created_at
            FROM products JOIN categories using(category_id) 
            WHERE title ILIKE '%' || $1 || '%' OFFSET $2 LIMIT $3 `,
            [title, offset, limit]
        );

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get Product Success",
            data: {
                products: results.rows,
                page: page,
                total: limit,
                totalPage: Math.ceil(
                    totalProducts.rows[0].number_of_products / limit
                ),
                totalProducts: Number(totalProducts.rows[0].number_of_products),
            },
        };
    }

    async getProductByNewTime(
        offset: string,
        limit: string
    ): Promise<ResponseType<ProductType[]>> {
        const results = await query(
            `SELECT product_id, title, price, discount 
            FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2 `,
            [limit, offset]
        );

        if (!results.rows.length) {
            return {
                statusCode: HttpStatusCode.NOT_FOUND,
                message: "Product not found",
            };
        }

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get Product Success",
            data: results.rows,
        };
    }

    // "Giá dưới 500.0000"; 0 - 500.000
    // "500.000đ - 1.000.000đ";
    // "1.000.000đ - 5.000.000đ";
    // "Giá trên 10.000.000đ";
    async getProductByFilter(
        category_id: number,
        brand: string[],
        price: number[],
        page: number,
        limit: number
    ): Promise<ResponseType<any>> {
        // dòng đầu tmp để lưu xâu định dạng: ["'a'", "'b'"]
        // vì khi vào cái rest dưới nếu để là ["a","b"] => se thanh (a,b) trong câu query
        const tmp = brand.map((item) => `'${item}'`);
        const brand_filter = brand.length <= 0 ? "" : `(${[...tmp]})`;

        const prices = price.length <= 0 ? [] : price;

        let priceArr: string[] = [];
        price.map((item: any) => {
            // 0 - 5.000.000 : tức là không có cận dưới (<=)
            if (!item[0]) {
                return priceArr.push(`(price <= ${item[1]})`);
            }

            // 5.000.000 - 0 : tức là không có cận trên (>=)
            if (!item[1]) {
                return priceArr.push(`(price >= ${item[0]})`);
            }
            return priceArr.push(
                `(price >= ${item[0]} and price <= ${item[1]})`
            );
        });

        const price_filter = !prices.length ? "" : `(${priceArr.join(" OR ")})`;

        let query_filter: string = "";
        let count_filter: string = "";

        const offset = (page - 1) * limit;

        if (!brand_filter.length && !price_filter.length) {
            query_filter = `SELECT product_id, title, description, cast(price as int), cast(discount as int), volume, brand, quantity, created_at FROM products WHERE category_id = ${category_id} OFFSET ${offset} LIMIT ${limit}`;
            count_filter = `SELECT count(*) n_product FROM products WHERE category_id = ${category_id}`;
        } else if (!brand_filter.length) {
            query_filter = `SELECT product_id, title, description, cast(price as int), cast(discount as int), volume, brand, quantity, created_at FROM products WHERE category_id = ${category_id} AND ${price_filter} OFFSET ${offset} LIMIT ${limit}`;
            count_filter = `SELECT count(*) n_product FROM products WHERE category_id=${category_id} AND ${price_filter} `;
        } else if (!price_filter.length) {
            query_filter = `SELECT product_id, title, description, cast(price as int), cast(discount as int), volume, brand, quantity, created_at FROM products WHERE category_id=${category_id} AND brand IN ${brand_filter} OFFSET ${offset} LIMIT ${limit}`;
            count_filter = `SELECT count(*) n_product FROM products WHERE category_id=${category_id} AND brand IN ${brand_filter} `;
        } else {
            query_filter = `SELECT product_id, title, description, cast(price as int), cast(discount as int), volume, brand, quantity, created_at FROM products WHERE category_id=${category_id} AND brand IN ${brand_filter} and ${price_filter} OFFSET ${offset} LIMIT ${limit}`;
            count_filter = `SELECT count(*) n_product FROM products WHERE category_id=${category_id} AND brand IN ${brand_filter} and ${price_filter} `;
        }

        const results = await query(query_filter);
        const resCountFilter = await query(count_filter);

        return {
            statusCode: HttpStatusCode.OK,
            message: "Get products success",
            data: {
                products: results.rows,
                page: page,
                total: limit,
                totalPage: Math.ceil(resCountFilter.rows[0].n_product / limit),
                totalProduct: Number(resCountFilter.rows[0].n_product),
            },
        };
    }

    //update product by id
    async updateProductById(product: any): Promise<ResponseType<any>> {
        const {
            product_id,
            title,
            description,
            category_id,
            volume,
            price,
            quantity,
            year_publish,
            brand,
            discount,
        } = product;

        const results = await query(
            `UPDATE products SET title = $1, category_id = $2, 
            brand = $3, year_publish = $4, volume = $5, price = $6, discount = $7, quantity = $8,
            description = $9, updated_at = current_date
            WHERE product_id = $10  RETURNING *
        `,
            [
                title,
                category_id,
                brand,
                year_publish,
                volume,
                Number(price),
                Number(discount),
                quantity,
                description,
                product_id,
            ]
        );

        return {
            statusCode: HttpStatusCode.OK,
            message: "Update successfull",
            data: results.rows[0],
        };
    }

    // create product
    async createProduct(
        product: ProductType,
        photos: PhotoType[]
    ): Promise<ResponseType<ProductType>> {
        const {
            title,
            description,
            category_id,
            volume,
            price,
            quantity,
            year_publish,
            brand,
            discount,
        } = product;

        const results = await query(
            `INSERT INTO products VALUES (DEFAULT, $1, $2,$3,$4,$5,$6,$7,$8,$9, current_date, current_date) RETURNING *`,
            [
                category_id,
                title,
                description,
                brand,
                year_publish,
                volume,
                price,
                discount,
                quantity,
            ]
        );

        if (!results.rowCount) {
            return {
                statusCode: HttpStatusCode.BAD_REQUEST,
                message: "Create product failed",
                data: results.rows[0],
            };
        }

        await this.createProductPhoto(photos, results.rows[0].product_id);

        return {
            statusCode: HttpStatusCode.OK,
            message: "Create product successfull",
            data: results.rows[0],
        };
    }

    //create product image
    async createProductPhoto(
        product_photos: { public_id: string; secure_url: string }[],
        product_id: number
    ): Promise<ResponseType<any>> {
        const promises = product_photos.map(
            (photo: { public_id: string; secure_url: string }) =>
                query(
                    `INSERT INTO product_photos 
             VALUES (DEFAULT, $1, $2, $3) RETURNING *`,
                    [product_id, photo.secure_url, photo.public_id]
                )
        );

        const results = await Promise.all(promises)
            .then((res) => res)
            .catch((err) => err);

        /// neu thanh cong se tra ve 1 mang result cua moi cau query

        return {
            statusCode: HttpStatusCode.OK,
            message: "Create product photo successfull",
            data: results.map((item: any) => item.rows[0]),
        };
    }

    // count products in store
    async countProducts(): Promise<number> {
        const results = await query(
            `SELECT count(product_id) number_of_products FROM products`
        );

        return Number(results.rows[0].number_of_products);
    }
}

export const productService: ProductService = new ProductService();
