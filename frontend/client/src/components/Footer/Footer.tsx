import { Group, Text } from "@mantine/core";

export function Footer() {
    return (
        <Group
            position="apart"
            p={20}
            sx={{ width: "100%", background: "rgb(97 42 42)" }}
        >
            <Text size="20px" fw={500} color="white">
                Copyright - Made by Luan Dinh
            </Text>
            <Text size="20px" fw={500} color="white">
                Contact: dinhvanluan2k3@gmail.com
            </Text>
        </Group>
    );
}
