import {
    Stack,
    Text,
    SimpleGrid,
    Card,
    Group,
    Button,
    Badge,
    Center,
    createStyles,
    Divider,
    Flex,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { IconShoppingCartPlus, IconEye } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

import { ProductAvatar } from "../Product/ProductAvatar";
import { CartContext } from "../../providers/CartProvider/CartProvider";
import { productService } from "../../services/product.service";
import { ProductType, ProductConstant } from "../../types/products.type";
import { CategoryType } from "../../types/category.type";

const useStyles = createStyles(() => ({
    hover: {
        "&:hover": {
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
            cursor: "pointer",
        },
    },
}));

export function CharmCate({ category }: { category: CategoryType }) {
    const { classes } = useStyles();
    const { addCartItem } = useContext(CartContext);

    const [products, setProducts] = useState<ProductType[]>([ProductConstant]);

    const handleGetProductByCateId = async () => {
        const resProduct = await productService.getProductByCateId(
            category.category_id,
            1,
            8
        );
        setProducts(resProduct.data.products);
    };

    const handleAddToCart = async (product: ProductType) => {
        const { product_id, title, price, discount, brand, volume } = product;
        const cartItem = {
            product_id,
            title,
            price,
            discount,
            brand,
            volume,
            quantity: 1,
        };
        addCartItem(cartItem);

        notifications.show({
            title: "Thành công",
            message: "Bạn đã thêm thành công sản phẩm :>",
        });
    };

    useEffect(() => {
        handleGetProductByCateId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack sx={{ width: "100%" }}>
            <Text size="20px" fw={500} key={category.category_id}>
                {category.category_name}
            </Text>

            <SimpleGrid
                cols={4}
                sx={{
                    width: "100%",
                }}
                breakpoints={[
                    { maxWidth: "sm", cols: 2 },
                    { minWidth: "sm", cols: 3 },
                    { minWidth: "md", cols: 3 },
                    { minWidth: 1200, cols: 4 },
                ]}
            >
                {products.length > 0 &&
                    products.map((product: ProductType) => (
                        <Card
                            shadow="sm"
                            padding="lg"
                            radius="md"
                            withBorder
                            className={classes.hover}
                            key={product.product_id}
                        >
                            <Card.Section>
                                <Link
                                    to={`/product/${product.product_id}/detail`}
                                >
                                    {product.product_id !== 0 && (
                                        <ProductAvatar
                                            data={product.product_id}
                                        />
                                    )}
                                </Link>
                            </Card.Section>

                            <Group position="apart">
                                <Link
                                    to={`/product/${product.product_id}/detail`}
                                    state={{ product: product }}
                                >
                                    <Text
                                        weight={500}
                                        lineClamp={2}
                                        color="black"
                                        sx={{
                                            lineHeight: "16px",
                                            height: "32px",
                                        }}
                                    >
                                        {product.title}
                                    </Text>
                                </Link>
                            </Group>

                            <Text>
                                {product.brand} / {product.volume}ml
                            </Text>

                            <Flex
                                wrap="wrap"
                                gap={10}
                                sx={{
                                    "@media (max-width: 48em)": {
                                        gap: "0",
                                    },
                                }}
                            >
                                <Text fw={500}>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        maximumFractionDigits: 9,
                                    }).format(
                                        product.price *
                                            (1 - product.discount / 100)
                                    )}
                                </Text>
                                <Text td="line-through">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        maximumFractionDigits: 9,
                                    }).format(product.price)}
                                </Text>
                            </Flex>

                            <Group spacing={4}>
                                <Button
                                    size="16px"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <IconShoppingCartPlus />
                                </Button>

                                <Button size="16px">
                                    <Link
                                        to={`/product/${product.product_id}/detail`}
                                        state={{ product: product }}
                                        style={{ color: "white" }}
                                    >
                                        <IconEye />
                                    </Link>
                                </Button>
                            </Group>
                            {product.discount > 0 && (
                                <Badge
                                    color="pink"
                                    variant="light"
                                    sx={{
                                        position: "absolute",
                                        top: "10px",
                                        left: "10px",
                                    }}
                                >
                                    -{product.discount}%
                                </Badge>
                            )}
                        </Card>
                    ))}
            </SimpleGrid>
            <Center>
                <Link
                    to={`/product/${category.category_id}/filter`}
                    state={{ category_name: category.category_name }}
                >
                    <Text color="gray">View All</Text>
                </Link>
            </Center>

            <Divider></Divider>
        </Stack>
    );
}
