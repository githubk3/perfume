import { FileInputProps, Group, Center, rem } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";

function Value({ file }: { file: File }) {
    return (
        <Center
            inline
            sx={(theme) => ({
                backgroundColor:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[7]
                        : theme.colors.gray[1],
                fontSize: theme.fontSizes.xs,
                padding: `${rem(3)} ${rem(7)}`,
                borderRadius: theme.radius.sm,
            })}
        >
            <IconPhoto size={rem(14)} style={{ marginRight: rem(5) }} />
            <span
                style={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: rem(200),
                    display: "inline-block",
                }}
            >
                {file.name}
            </span>
        </Center>
    );
}

export const ValueComponent: FileInputProps["valueComponent"] = ({ value }) => {
    if (Array.isArray(value)) {
        return (
            <Group spacing="sm" py="xs">
                {value.map((file, index) => (
                    <Value file={file} key={index} />
                ))}
            </Group>
        );
    }

    return <Value file={value} />;
};
