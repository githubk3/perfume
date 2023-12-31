import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
    Center,
    LoadingOverlay,
    Flex,
} from "@mantine/core";
import { useForm, isEmail, hasLength } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
    IconCheck,
    IconX,
    IconAt,
    IconLock,
    IconChevronLeft,
    IconBrandFacebook,
    IconBrandGoogle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

import { authService } from "../../services/auth.service";
import { AuthContext } from "../../providers/AuthProvider/AuthProvider";
import { createWindow } from "../../helpers/createWindow.helper";
import { BASE_URL_API } from "../../configs/server.config";

export function LoginAuth() {
    const [loading, setLoading] = useState(false);
    const [isOAuth, setIsOAuth] = useState({
        status: false,
        messageOAuth: "",
    });

    const { setProfile } = useContext(AuthContext);

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },

        validateInputOnBlur: true,

        validate: {
            email: isEmail("Invalid email"),
            password: hasLength(
                { min: 8, max: 20 },
                "Value must have 8 or more characters"
            ),
        },
    });

    const navigate = useNavigate();

    const handleError = (errors: typeof form.errors): void => {
        if (errors.password) {
            showNotification({
                message: "Pass word incorrect",
                color: "red",
            });
        } else if (errors.email) {
            showNotification({
                message: "Please provide a valid email",
                color: "red",
            });
        }
    };

    const handleSubmit = (values: typeof form.values): void => {
        localStorage.setItem("messageOAuth", "");

        setIsOAuth((prev: { status: boolean; messageOAuth: string }) => ({
            ...prev,
            status: false,
            messageOAuth: "",
        }));

        handleValidate(values);
    };

    const handleValidate = async (values: typeof form.values) => {
        try {
            setLoading(true);
            const resAuth = await authService.login(values);
            setLoading(false);

            if (resAuth.statusCode !== 200) {
                return showNotification({
                    title: "Login failed",
                    message: resAuth.message,
                    color: "red",
                    icon: <IconX />,
                    autoClose: 3000,
                });
            }

            // set token on localStorage
            localStorage.setItem(
                "access_token_user",
                resAuth.data.access_token_user
            );

            localStorage.setItem(
                "refresh_token_user",
                resAuth.data.refresh_token_user
            );

            showNotification({
                message: "You login successfully!",
                color: "yellow",
                icon: <IconCheck />,
                autoClose: 3000,
            });

            const response = await authService.getProfile();
            setProfile(response.data);
            localStorage.setItem("isAuthenticated", "true");
            navigate("/");
            form.reset();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showNotification({
                title: "Login failure!",
                message: error.response.data.message,
                color: "red",
                icon: <IconX />,
                autoClose: 3000,
            });
            setLoading(false);
        }
    };

    const handleLoginWithOAuth = (method_auth: string) => {
        localStorage.setItem("messageOAuth", "");

        setIsOAuth((prev: { status: boolean; messageOAuth: string }) => ({
            ...prev,
            status: false,
            messageOAuth: "",
        }));

        let timer: ReturnType<typeof setTimeout> | null = null;

        const newWindow = createWindow(
            `${BASE_URL_API}/auth/${method_auth}/login`,
            "_blank",
            800,
            600
        );

        if (newWindow) {
            timer = setInterval(async () => {
                if (newWindow.closed) {
                    JSON.parse(
                        localStorage.getItem("isAuthenticated") as string
                    )
                        ? navigate("/")
                        : setIsOAuth({
                              status: true,
                              messageOAuth: localStorage.getItem(
                                  "messageOAuth"
                              ) as string,
                          });

                    if (timer) clearInterval(timer);
                }
            }, 500);
        }
    };

    useEffect(() => {
        if (JSON.parse(localStorage.getItem("isAuthenticated") as string))
            navigate(-1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Link to="/">
                <Group spacing={0}>
                    <IconChevronLeft />
                    <Text color="gray">Go back home</Text>
                </Group>
            </Link>
            <Center>
                <Container size={420} my={40}>
                    <Title
                        align="center"
                        sx={(theme) => ({
                            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                            fontWeight: 900,
                        })}
                    >
                        PERFUME & LDA!
                    </Title>
                    <Text color="dimmed" size="sm" align="center" mt={5}>
                        Do you have account?{" "}
                        <Link to="/register" style={{ color: "blue" }}>
                            SignUp
                        </Link>
                    </Text>

                    <Flex
                        style={{ width: "100%" }}
                        justify="center"
                        gap="md"
                        mt={10}
                    >
                        <Group>
                            <Button
                                onClick={() => handleLoginWithOAuth("facebook")}
                            >
                                <IconBrandFacebook />
                                &nbsp;
                                <Text>FACEBOOK</Text>
                            </Button>
                        </Group>

                        <Group>
                            <Button
                                color="red"
                                onClick={() => handleLoginWithOAuth("google")}
                            >
                                <IconBrandGoogle />
                                &nbsp;
                                <Text>GOOGLE</Text>
                            </Button>
                        </Group>
                    </Flex>
                    <Flex mt={8}>
                        {isOAuth.status && (
                            <span style={{ color: "red" }}>
                                {isOAuth.messageOAuth}
                            </span>
                        )}
                    </Flex>

                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        <form
                            onSubmit={form.onSubmit(handleSubmit, handleError)}
                        >
                            <TextInput
                                label="Email"
                                placeholder="lda@gmail.com"
                                icon={<IconAt size={16} />}
                                required
                                {...form.getInputProps("email")}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                icon={<IconLock size={16} />}
                                required
                                mt="md"
                                {...form.getInputProps("password")}
                            />
                            <Group position="apart" mt="lg">
                                <Link
                                    to="/forgot_password"
                                    style={{ color: "blue" }}
                                >
                                    Forgot Password ?
                                </Link>
                            </Group>
                            <Button
                                fullWidth
                                mt="xl"
                                type="submit"
                                disabled={loading}
                            >
                                SignIn
                            </Button>
                            <LoadingOverlay
                                sx={{ position: "fixed", height: "100%" }}
                                loaderProps={{
                                    size: "sm",
                                    color: "pink",
                                    variant: "oval",
                                }}
                                overlayOpacity={0.3}
                                overlayColor="#c5c5c5"
                                visible={loading}
                            />
                        </form>
                    </Paper>
                </Container>
            </Center>
        </>
    );
}
