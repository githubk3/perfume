import {
    createStyles,
    Header,
    Group,
    Button,
    Text,
    Divider,
    Box,
    Burger,
    Drawer,
    ScrollArea,
    rem,
    // ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../providers/AuthProvider/AuthProvider";
import { authService } from "../../services/auth.service";

const useStyles = createStyles((theme) => ({
    link: {
        display: "flex",
        alignItems: "center",
        height: "100%",
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        textDecoration: "none",
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,

        [theme.fn.smallerThan("sm")]: {
            height: rem(42),
            display: "flex",
            alignItems: "center",
            width: "100%",
        },

        ...theme.fn.hover({
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
        }),
    },

    subLink: {
        width: "100%",
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        borderRadius: theme.radius.md,

        ...theme.fn.hover({
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
        }),

        "&:active": theme.activeStyles,
    },

    dropdownFooter: {
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[0],
        margin: `calc(${theme.spacing.md} * -1)`,
        marginTop: theme.spacing.sm,
        padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
        paddingBottom: theme.spacing.xl,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[1]
        }`,
    },

    hiddenMobile: {
        [theme.fn.smallerThan("sm")]: {
            display: "none",
        },
    },

    hiddenDesktop: {
        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },
}));

export function HeaderApp() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
        useDisclosure(false);
    const { classes, theme } = useStyles();
    const { profile, setProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const res = await authService.logout();

        if (res.statusCode === 200) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            setProfile({
                admin_id: 0,
                role: "",
                username: "",
            });
            localStorage.removeItem("isAuthenticated");

            notifications.show({
                message: res.message,
            });

            navigate("/login");
        }
    };

    return (
        <Box>
            <Header height={60} px="md">
                <Group position="apart" sx={{ height: "100%" }}>
                    {/* <ActionIcon>
                        <IconMenu2 size={24} />
                    </ActionIcon> */}
                    <Text size={24} fw={700} c="blue">
                        Dashboard
                    </Text>
                    {profile.admin_id ? (
                        <Group className={classes.hiddenMobile}>
                            <Button variant="default">
                                {profile.username}
                            </Button>
                            <Button onClick={() => handleLogout()}>
                                Logout
                            </Button>
                        </Group>
                    ) : (
                        <Group className={classes.hiddenMobile}>
                            <Button variant="default">
                                <Link
                                    to="/login"
                                    style={{ textDecoration: "none" }}
                                >
                                    Log in
                                </Link>
                            </Button>
                            <Button>Sign up</Button>
                        </Group>
                    )}

                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        className={classes.hiddenDesktop}
                    />
                </Group>
            </Header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                className={classes.hiddenDesktop}
                zIndex={1000000}
            >
                <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
                    <Divider
                        my="sm"
                        color={
                            theme.colorScheme === "dark" ? "dark.5" : "gray.1"
                        }
                    />

                    <Divider
                        my="sm"
                        color={
                            theme.colorScheme === "dark" ? "dark.5" : "gray.1"
                        }
                    />

                    <Group position="center" grow pb="xl" px="md">
                        <Button>Luan Dinh</Button>
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}
