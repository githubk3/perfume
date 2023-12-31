import { Flex } from "@mantine/core";
import { useLocation } from "react-router-dom";
import { useState } from "react";

import { FilterOption } from "../Filter";
import { FilterResult } from "./FilterResult";
import { TitlePageWrapper } from "../TitlePageWrapper/TitlePageWrapper";
import { getItemLocalStorage } from "../../helpers/handleLocalStorage.helper";

export function FilterProduct() {
    const [prices, setPrices] = useState<string[]>(
        getItemLocalStorage("price") ? getItemLocalStorage("price") : []
    );
    const [filterBrand, setFilterBrand] = useState<string[]>(
        getItemLocalStorage("brand") ? getItemLocalStorage("brand") : []
    );
    const { state } = useLocation();

    return (
        <TitlePageWrapper title={state.category_name}>
            <div
                style={{
                    display: "flex",
                    height: "calc(100%-80px)",
                }}
            >
                <Flex
                    gap={20}
                    sx={{
                        width: "100%",
                        "@media (max-width: 64em)": {
                            flexDirection: "column",
                        },
                    }}
                >
                    <Flex
                        sx={{
                            "@media (max-width: 64em)": {
                                width: "100%",
                            },
                            "@media (min-width: 64em)": {
                                width: "274px",
                                height: "100%",
                            },
                        }}
                    >
                        <FilterOption
                            prices={prices}
                            setPrices={setPrices}
                            filterBrand={filterBrand}
                            setFilterBrand={setFilterBrand}
                        />
                    </Flex>
                    <div style={{ flex: 1 }}>
                        <FilterResult
                            prices={prices}
                            filterBrand={filterBrand}
                        />
                    </div>
                </Flex>
            </div>
        </TitlePageWrapper>
    );
}
