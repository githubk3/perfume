import { useEffect, useState } from "react";
import {
    createStyles,
    Table,
    Checkbox,
    rem,
    Stack,
    Group,
    Flex,
    Box,
    Pagination,
    ActionIcon,
    Select,
} from "@mantine/core";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IconEye } from "@tabler/icons-react";

import { orderService } from "../../services/order.service";
import { handleOrderDate } from "../../helpers/handleOrderDate.helpter";
import { ExportCSV } from "../ExportCsv/ExportCsv";

const useStyles = createStyles((theme) => ({
    rowSelected: {
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
                : theme.colors[theme.primaryColor][0],
    },
}));

interface OrderType {
    order_id: number;
    customer_id: number;
    n_item: number;
    tax: number;
    delivery_cost: number;
    tong_giam_gia: number;
    order_date: string;
    tong_hoa_don: number;
    payment_type: string;
}

export function OrderList() {
    const [orders, setOrders] = useState<OrderType[] | []>([]);
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState<string>("10");
    const { classes, cx } = useStyles();
    const [selection, setSelection] = useState<number[]>([0]);
    const { status } = useParams();
    const navigate = useNavigate();
    // const [debounced] = useDebouncedValue(value, 200);

    const toggleRow = (id: number) =>
        setSelection((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    const toggleAll = () =>
        setSelection((current) =>
            current.length === orders.length
                ? []
                : orders.map((item) => item.order_id)
        );

    const handleListOrders = async () => {
        const data = await orderService.getOrder(
            page,
            Number(total),
            status as string
        );

        setTotalPage(data.data.totalPage);
        setOrders(data.data.orders);
    };

    useEffect(() => {
        handleListOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, total, status]);

    useEffect(() => {
        setPage(1);
    }, [total]);

    const rows =
        orders.length &&
        orders.map((item: OrderType) => {
            const selected = selection.includes(item.order_id);
            return (
                <tr
                    key={item.order_id}
                    className={cx({ [classes.rowSelected]: selected })}
                >
                    <td>
                        <Checkbox
                            checked={selection.includes(item.order_id)}
                            onChange={() => toggleRow(item.order_id)}
                            transitionDuration={0}
                        />
                    </td>
                    <td>{item.order_id}</td>
                    <td>{item.customer_id}</td>
                    <td>{item.n_item}</td>
                    <td>{item.tax}</td>
                    <td>
                        {new Intl.NumberFormat("vi-VN").format(
                            item.delivery_cost
                        )}
                    </td>
                    <td>{item.tong_giam_gia}</td>
                    <td>
                        {new Intl.NumberFormat("vi-VN").format(
                            item.tong_hoa_don
                        )}
                    </td>
                    <td>{handleOrderDate(item.order_date)}</td>
                    <td>{item.payment_type}</td>
                    <td>
                        <Link to={`/order/detail/${item.order_id}`}>
                            <ActionIcon>
                                <IconEye />
                            </ActionIcon>
                        </Link>
                    </td>
                </tr>
            );
        });

    return (
        <Stack>
            <Group>
                <Flex sx={{ width: "100%" }} justify="flex-end">
                    <Group>
                        <Select
                            data={[
                                {
                                    value: "all",
                                    label: "All",
                                },
                                {
                                    value: "ordered",
                                    label: "Ordered",
                                },
                                {
                                    value: "canceled",
                                    label: "Canceled",
                                },
                                {
                                    value: "accepted",
                                    label: "Accepted",
                                },
                                {
                                    value: "done",
                                    label: "Done",
                                },
                            ]}
                            value={status}
                            onChange={(value: string) => {
                                setPage(1);
                                navigate(`/order/${value}`);
                            }}
                            withAsterisk
                        />

                        <Box>
                            <ExportCSV
                                csvData={orders}
                                fileName={`Thông-tin-đơn-hàng ${new Date()}`}
                            />
                        </Box>
                    </Group>
                </Flex>
            </Group>

            <Table miw={800} verticalSpacing="sm" striped>
                <thead>
                    <tr>
                        <th style={{ width: rem(40) }}>
                            <Checkbox
                                onChange={toggleAll}
                                checked={selection.length === orders.length}
                                indeterminate={
                                    selection.length > 0 &&
                                    selection.length !== orders.length
                                }
                                transitionDuration={0}
                            />
                        </th>

                        <th>OrderId</th>
                        <th>CustomerId</th>
                        <th>NItems</th>
                        <th>Tax(%)</th>
                        <th>Delivery Cost(vnd)</th>
                        <th>Discount(%)</th>
                        <th>Total(vnd)</th>
                        <th>Ordered Date</th>
                        <th>Payment Method</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>

            <Flex sx={{ width: "100%" }} justify="flex-end" gap="xs">
                <Select
                    placeholder="Pick one"
                    data={[
                        { value: "10", label: "10 products" },
                        { value: "20", label: "20 products" },
                        { value: "50", label: "50 products" },
                        { value: "100", label: "100 products" },
                    ]}
                    value={total}
                    onChange={setTotal}
                />
                <Pagination value={page} onChange={setPage} total={totalPage} />
            </Flex>
        </Stack>
    );
}
