import React, { useEffect, useRef, useState } from "react";
import TutorialIcon from "../../assets/icon-tutorial.svg";
import KeyboardIcon from "../../assets/icon-keyboard.svg";
import DistanceIcon from "../../assets/icon-distance.svg";
import SpendTitle from "./assets/spend-title.svg";
import FuelIcon from "@/assets/icon-fuel.svg";
import BatteryIcon from "@/assets/icon-battery.svg";
import AttackIcon from "./assets/attack-button.svg";
import Plane from "./assets/plane.svg";
import BBg from "./assets/button-bg.svg";
import Bg from "./assets/bg.png";
import WarnIcon from "./assets/icon-warn.svg";
import qs from "query-string";

import {
    Box,
    HStack,
    Img,
    Slider,
    SliderFilledTrack,
    SliderTrack,
    Text,
    VStack,
    Input,
    useToast,
} from "@chakra-ui/react";
import Tutorial from "./Tutorial";
import { useKnobVisibility } from "@/contexts/KnobVisibilityContext";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/utils/useDebounce";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import {
    useSkylabBaseContract,
    useSkylabGameFlightRaceContract,
    useSkylabResourcesContract,
} from "@/hooks/useContract";
import MetadataPlaneImg from "@/skyConstants/metadata";
import { SubmitButton } from "../Button/Index";
import SkyToast from "../Toast";
import { handleError } from "@/utils/error";

const Airplane = ({
    level,
    tokenId,
    fuelBalance,
    batteryBalance,
}: {
    level: number;
    tokenId: number;
    fuelBalance: string;
    batteryBalance: string;
}) => {
    return (
        <Box>
            <Text sx={{ fontSize: "40px", fontWeight: 600 }}>
                Level {level}
            </Text>
            <Box sx={{ position: "relative" }} width="500px" h={"500px"}>
                {tokenId && (
                    <Img src={MetadataPlaneImg(tokenId)} w="100%"></Img>
                )}
                <Box
                    sx={{
                        border: "3px solid #FFF761",
                        width: "216px",
                        height: "94px",
                        borderRadius: "100px",
                        padding: "3px",
                        position: "absolute",
                        right: "100px",
                        top: "20px",
                    }}
                >
                    <HStack
                        sx={{
                            background: `url(${BBg}) no-repeat`,
                            backgroundSize: "cover",
                            width: "100%",
                            borderRadius: "100px",
                        }}
                    >
                        <Box
                            sx={{
                                borderRadius: "50%",
                                height: "82px",
                                width: "82px",
                                background:
                                    "linear-gradient(90deg, #E8EF41 0%, rgba(0, 0, 0, 0.6) 78.22%)",
                                border: "3px solid #FFF761",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Img src={FuelIcon} sx={{ width: "60px" }}></Img>
                        </Box>
                        <VStack sx={{ marginInlineStart: '0 !important"' }}>
                            <Text
                                sx={{
                                    color: "#FFF761",
                                    fontSize: "36px",
                                    fontWeight: 500,
                                    lineHeight: "36px",
                                }}
                            >
                                {fuelBalance}
                            </Text>
                            <Text
                                sx={{
                                    color: "#BCBBBE",
                                    fontSize: "20px",
                                    fontWeight: 400,
                                    lineHeight: "29px",
                                }}
                            >
                                Remaining
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
                <Box
                    sx={{
                        border: "3px solid #FFF761",
                        width: "216px",
                        height: "94px",
                        borderRadius: "100px",
                        padding: "3px",
                        position: "absolute",
                        right: "-50px",
                        top: "130px",
                    }}
                >
                    <HStack
                        sx={{
                            background: `url(${BBg}) no-repeat`,
                            backgroundSize: "cover",
                            width: "100%",
                            borderRadius: "100px",
                        }}
                    >
                        <Box
                            sx={{
                                borderRadius: "50%",
                                height: "82px",
                                width: "82px",
                                background:
                                    "linear-gradient(90deg, #E8EF41 0%, rgba(0, 0, 0, 0.6) 78.22%)",
                                border: "3px solid #FFF761",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Img src={BatteryIcon} sx={{ width: "70px" }}></Img>
                        </Box>
                        <VStack sx={{ marginInlineStart: '0 !important"' }}>
                            <Text
                                sx={{
                                    color: "#FFF761",
                                    fontSize: "36px",
                                    fontWeight: 500,
                                    lineHeight: "36px",
                                }}
                            >
                                {batteryBalance}
                            </Text>
                            <Text
                                sx={{
                                    color: "#BCBBBE",
                                    fontSize: "20px",
                                    fontWeight: 400,
                                    lineHeight: "29px",
                                }}
                            >
                                Remaining
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </Box>
        </Box>
    );
};

enum Action {
    Decrease,
    Increase,
}

const Resource = () => {
    const toast = useToast();
    const { search } = useLocation();
    const [gameLevel, setGameLevel] = useState(null);
    const [tokenId, setTokenId] = useState<number>();
    const skylabBaseContract = useSkylabBaseContract();
    const skylabGameFlightRaceContract = useSkylabGameFlightRaceContract();
    const skylabResourcesContract = useSkylabResourcesContract();
    const { account } = useActiveWeb3React();
    const inputFuelRef = useRef<any>(null);
    const inputBatteryRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const [fuelError, setFuelError] = useState("");
    const [batteryError, setBatteryError] = useState("");

    const [fuelValue, setFuelValue] = useState(""); //汽油输入的值
    const [batteryValue, setBatteryValue] = useState("");

    const [fuelSlider, setFuelSlider] = useState(0); //汽油输入的值
    const [batterySlider, setBatterySlider] = useState(0);

    const [fuelBalance, setFuelBalance] = useState("");
    const [batteryBalance, setBatteryBalance] = useState("");

    const fuelDebounce = useDebounce(fuelError, 1000);
    const batteryDebounce = useDebounce(batteryError, 1000);

    const navigate = useNavigate();
    const [tutorial, setTutorial] = useState(
        localStorage.getItem("spendResource") ? false : true,
    );
    const handleOpenTutorial = () => {
        setTutorial(true);
    };
    const handleCancelTutorial = () => {
        localStorage.setItem("spendResource", "true");
        setTutorial(false);
    };
    const handleKeyboard = () => {
        navigate("/game/Keyboard");
    };

    const handleDistance = () => {
        navigate("/game/distance");
    };

    const handleFuelSlider = (value: number) => {
        setFuelSlider(value);
        const amount = ((value * Number(fuelBalance)) / 100).toFixed(0);
        setFuelValue(String(amount));
    };

    const handleBatterySlider = (value: number) => {
        setBatterySlider(value);
        const amount = ((value * Number(batteryBalance)) / 100).toFixed(0);
        setBatteryValue(String(amount));
    };

    const handleFuelValue = (value: string) => {
        setFuelValue(value);
        if (Number(value) > Number(fuelBalance)) {
            setFuelError("Insufficient Resource");
            setFuelSlider(100);
        } else {
            setFuelError("");
            setFuelSlider((Number(value) / Number(fuelBalance)) * 100);
        }
    };

    const handleFuelBlur = () => {
        if (Number(fuelValue) > Number(fuelBalance)) {
            setFuelValue(fuelBalance);
        }
    };

    const handleBatteryBlur = () => {
        if (Number(batteryValue) > Number(batteryBalance)) {
            setBatteryValue(batteryBalance);
        } else {
            const balance = String(
                Number(batteryBalance) - Number(batteryValue),
            );
        }
    };

    const handleBatteryValue = (value: string) => {
        setBatteryValue(value);
        if (Number(value) > Number(batteryBalance)) {
            setBatteryError("Insufficient Resource");
            setBatterySlider(100);
        } else {
            setBatteryError("");
            setBatterySlider((Number(value) / Number(batteryBalance)) * 100);
        }
    };

    const handleFFocus = () => {
        setTimeout(() => {
            inputFuelRef?.current?.focus();
        }, 0);
    };

    const handleBFocus = () => {
        setTimeout(() => {
            inputBatteryRef?.current?.focus();
        }, 0);
    };

    const getResourcesBalance = async () => {
        const _planeFuelBalance =
            await skylabBaseContract._aviationResourcesInTanks(tokenId, 0);
        const planeBatteryBalance =
            await skylabBaseContract._aviationResourcesInTanks(tokenId, 1);
        setBatteryBalance(planeBatteryBalance.toString());
        setFuelBalance(_planeFuelBalance.toString());
    };

    // 开始玩游戏
    const handlePlayGame = async () => {
        try {
            const state = await skylabGameFlightRaceContract.gameState(tokenId);
            const stateString = state.toString();
            if (stateString === "0") {
                setLoading(true);
                const loadRes =
                    await skylabGameFlightRaceContract.loadFuelBatteryToGameTank(
                        tokenId,
                        fuelValue ? fuelValue : 0,
                        batteryValue ? batteryValue : 0,
                    );

                await loadRes.wait();
                toast({
                    position: "top",
                    render: () => (
                        <SkyToast
                            message={"Resource successfully spended"}
                        ></SkyToast>
                    ),
                });
                await getResourcesBalance();
                const res = await skylabGameFlightRaceContract.searchOpponent(
                    tokenId,
                );
                await res.wait();
                toast({
                    position: "top",
                    render: () => (
                        <SkyToast
                            message={"Successfully joined the game"}
                        ></SkyToast>
                    ),
                });
                setTimeout(() => {
                    setLoading(false);
                    navigate(`/game?tokenId=${tokenId}`);
                }, 3000);
            } else {
                navigate(`/game?tokenId=${tokenId}`);
            }
        } catch (error) {
            setLoading(false);
            toast({
                position: "top",
                render: () => (
                    <SkyToast message={handleError(error)}></SkyToast>
                ),
            });
        }
    };

    const handleGetGameState = async () => {
        const state = await skylabGameFlightRaceContract.gameState(tokenId);
        const stateString = state.toString();
        if (stateString !== "0") {
            navigate(`/game?tokenId=${tokenId}`);
        }
    };

    // 获取飞机等级
    const handleGetGameLevel = async () => {
        const gameLevel = await skylabBaseContract._aviationLevels(tokenId);
        setGameLevel(gameLevel.toNumber());
    };

    useEffect(() => {
        const keyboardListener = (event: KeyboardEvent) => {
            const key = event.key;
            switch (key) {
                case "t":
                    handleOpenTutorial();
                    break;
                case "k":
                    handleKeyboard();
                    break;
                case "f":
                    handleFFocus();
                    break;
                case "b":
                    handleBFocus();
                    break;
                case "c":
                    handleDistance();
                    break;
                case "o": {
                    let value;
                    if (fuelValue && Number(fuelValue) > 0) {
                        value = Number(fuelValue) - 1;
                    } else {
                        value = 0;
                    }
                    handleFuelValue(String(value));
                    break;
                }
                case "p": {
                    let value;
                    if (fuelValue) {
                        value = Number(fuelValue) + 1;
                    } else {
                        value = 1;
                    }
                    handleFuelValue(String(value));
                    break;
                }
                case ",": {
                    let value;
                    if (batteryValue && Number(batteryValue) > 0) {
                        value = Number(batteryValue) - 1;
                    } else {
                        value = 0;
                    }
                    handleBatteryValue(String(value));
                    break;
                }
                case ".": {
                    let value;
                    if (batteryValue) {
                        value = Number(batteryValue) + 1;
                    } else {
                        value = 1;
                    }
                    handleBatteryValue(String(value));
                    break;
                }
            }
        };
        document.addEventListener("keydown", keyboardListener);
        return () => {
            document.removeEventListener("keydown", keyboardListener);
        };
    }, [fuelValue, batteryValue, fuelBalance, batteryBalance]);

    useEffect(() => {
        setFuelError("");
    }, [fuelDebounce]);
    useEffect(() => {
        setBatteryError("");
    }, [batteryDebounce]);

    useEffect(() => {
        if (
            !skylabBaseContract ||
            !skylabResourcesContract ||
            !account ||
            !tokenId
        ) {
            return;
        }
        getResourcesBalance();
    }, [account, skylabBaseContract, tokenId]);

    useEffect(() => {
        if (!skylabGameFlightRaceContract || !tokenId) {
            return;
        }
        handleGetGameLevel();
        handleGetGameState();
    }, [skylabGameFlightRaceContract, tokenId]);

    useEffect(() => {
        const params = qs.parse(search) as any;
        if (!params.tokenId) {
            navigate(`/mercury`);
            return;
        }
        setTokenId(params.tokenId);
    }, []);

    return tutorial ? (
        <Tutorial handleTutorial={handleCancelTutorial}></Tutorial>
    ) : (
        <Box
            sx={{}}
            fontFamily="Orbitron"
            bg={`url(${Bg}) no-repeat`}
            backgroundSize="100% 100%"
            h="100vh"
            pos="relative"
        >
            <Text
                fontSize="88px"
                fontWeight={800}
                pos="absolute"
                top="10px"
                left={"50px"}
            >
                Trailblazer
            </Text>
            <VStack
                sx={{}}
                pos="absolute"
                right={"27px"}
                top="21px"
                alignItems="flex-end"
            >
                <HStack onClick={handleOpenTutorial} sx={{ cursor: "pointer" }}>
                    <Text fontSize="24px" fontWeight={600} marginRight="10px">
                        Tutorial
                    </Text>
                    <Box
                        bg="rgba(255, 255, 255, 0.2)"
                        border="1px solid #FFFFFF"
                        w="42px"
                        h="37px"
                        textAlign="center"
                        lineHeight="37px"
                        borderRadius="10px"
                        marginRight="10px"
                        marginInlineStart="0 !important"
                    >
                        <Text fontSize="24px" fontWeight={600}>
                            T
                        </Text>
                    </Box>
                    <Img
                        cursor="pointer"
                        src={TutorialIcon}
                        w="60px"
                        h="60px"
                    ></Img>
                </HStack>
                <HStack sx={{ cursor: "pointer" }} onClick={handleKeyboard}>
                    <Text fontSize="24px" fontWeight={600} marginRight="10px">
                        Keyboard Short-cut Panel
                    </Text>
                    <Box
                        bg="rgba(255, 255, 255, 0.2)"
                        border="1px solid #FFFFFF"
                        w="42px"
                        h="37px"
                        textAlign="center"
                        lineHeight="37px"
                        borderRadius="10px"
                        marginRight="10px"
                        marginInlineStart="0 !important"
                    >
                        <Text fontSize="24px" fontWeight={600}>
                            K
                        </Text>
                    </Box>
                    <Img
                        cursor="pointer"
                        src={KeyboardIcon}
                        w="60px"
                        h="60px"
                    ></Img>
                </HStack>
                <HStack sx={{ cursor: "pointer" }} onClick={handleDistance}>
                    <Text fontSize="24px" fontWeight={600} marginRight="10px">
                        Distance Info Panel
                    </Text>
                    <Box
                        bg="rgba(255, 255, 255, 0.2)"
                        border="1px solid #FFFFFF"
                        w="42px"
                        h="37px"
                        textAlign="center"
                        lineHeight="37px"
                        borderRadius="10px"
                        marginRight="10px"
                        marginInlineStart="0 !important"
                    >
                        <Text fontSize="24px" fontWeight={600}>
                            C
                        </Text>
                    </Box>
                    <Img
                        cursor="pointer"
                        src={DistanceIcon}
                        w="60px"
                        h="60px"
                    ></Img>
                </HStack>
            </VStack>
            <Box
                pos={"absolute"}
                top="155px"
                h={"41px"}
                left="18vw"
                sx={{
                    fontFamily: "Quantico",
                }}
            >
                <HStack>
                    <Box w="668px" sx={{ marginRight: "100px" }}>
                        <HStack
                            bg={`url(${SpendTitle}) no-repeat`}
                            w="668px"
                            alignItems={"center"}
                        >
                            <Text
                                fontSize="48px"
                                fontWeight={400}
                                pl="100px"
                                lineHeight={"50px"}
                            >
                                Spend
                            </Text>
                        </HStack>
                        <Box>
                            <HStack
                                sx={{
                                    width: "680px",
                                    height: "300px",
                                    background: "rgba(217, 217, 217, 0.2)",
                                    border: "5px solid #FFF761",
                                    boxShadow:
                                        "10px 4px 4px rgba(0, 0, 0, 0.8)",
                                    borderRadius: "40px",
                                    marginTop: "18px",
                                    paddingLeft: "69px",
                                }}
                            >
                                <VStack sx={{ marginRight: "80px" }}>
                                    <Img src={FuelIcon} w="86px"></Img>
                                    <Text sx={{ fontSize: "40px" }}>Fuel</Text>
                                </VStack>
                                <Box
                                    sx={{
                                        width: "355px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: "2px dashed #FFF761",
                                            height: "85px",
                                            position: "relative",
                                        }}
                                    >
                                        <Input
                                            ref={inputFuelRef}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                fontSize: "40px",
                                                textAlign: "center",
                                                ":focus": {
                                                    border: "none",
                                                    boxShadow: "none",
                                                },
                                            }}
                                            placeholder="0"
                                            value={fuelValue}
                                            onChange={(e) => {
                                                handleFuelValue(e.target.value);
                                            }}
                                            onBlur={() => {
                                                handleFuelBlur();
                                            }}
                                            onKeyUp={(e) => {
                                                if (e.key === "Enter") {
                                                    inputFuelRef?.current?.blur();
                                                }
                                            }}
                                        />
                                        {!!fuelError && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    position: "absolute",
                                                    bottom: "-10px",
                                                    left: "0",
                                                    width: "100%",
                                                }}
                                            >
                                                <Img
                                                    src={WarnIcon}
                                                    sx={{
                                                        height: "40px",
                                                    }}
                                                ></Img>
                                                <Text
                                                    sx={{
                                                        color: "#FF2A0C",

                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {fuelError}
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                    <Slider
                                        aria-label="slider-ex-1"
                                        value={fuelSlider}
                                        sx={{
                                            height: "41px",
                                            marginTop: "11px",
                                        }}
                                        onChange={(e) => {
                                            handleFuelSlider(e);
                                        }}
                                    >
                                        <SliderTrack
                                            height={"33px"}
                                            sx={{
                                                background:
                                                    "rgba(217, 217, 217, 0.8)",
                                                borderRadius: "20px",
                                                border: "2px solid #E8EF41",
                                            }}
                                        >
                                            <SliderFilledTrack
                                                sx={{
                                                    background: "#FFF761",
                                                    borderRadius: "20px",
                                                }}
                                            />
                                        </SliderTrack>
                                    </Slider>
                                    <HStack
                                        sx={{ justifyContent: "space-between" }}
                                    >
                                        {[25, 50, 75, 100].map((item) => {
                                            return (
                                                <Box
                                                    key={item}
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        handleFuelSlider(item);
                                                    }}
                                                >
                                                    <Box
                                                        key={item}
                                                        sx={{
                                                            width: "80px",
                                                            height: "12px",
                                                            background:
                                                                Number(
                                                                    fuelSlider,
                                                                ) >= item
                                                                    ? "#FFF761"
                                                                    : "#D9D9D9",
                                                        }}
                                                    ></Box>
                                                    <Text
                                                        textAlign={"center"}
                                                        fontSize="20px"
                                                        color="#BCBBBE"
                                                    >
                                                        {item}%
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </HStack>
                                    {/* <HStack
                                        justifyContent={"flex-end"}
                                        sx={{ marginTop: "2px" }}
                                    >
                                        <Text
                                            sx={{
                                                color: "#FFF761",
                                                fontSize: "20px",
                                            }}
                                        >
                                            100
                                        </Text>
                                        <Text
                                            sx={{
                                                color: "#ABABAB",
                                                fontSize: "20px",
                                            }}
                                        >
                                            Cap
                                        </Text>
                                    </HStack> */}
                                </Box>
                            </HStack>
                            <HStack
                                sx={{
                                    marginTop: "11px",
                                }}
                            >
                                <Box
                                    sx={{
                                        background: "rgba(255, 255, 255, 0.2)",
                                        border: "1px solid #FFFFFF",
                                        borderRadius: "10px",
                                        width: "42px",
                                        height: "37px",
                                    }}
                                >
                                    <Text
                                        sx={{
                                            fontSize: "24px",
                                            fontWeight: 600,
                                            textAlign: "center",
                                        }}
                                    >
                                        F
                                    </Text>
                                </Box>
                                <Text
                                    sx={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Focus on the fuel load input
                                </Text>
                            </HStack>
                        </Box>
                        <Box>
                            <HStack
                                sx={{
                                    width: "680px",
                                    height: "300px",
                                    background: "rgba(217, 217, 217, 0.2)",
                                    border: "5px solid #FFF761",
                                    boxShadow:
                                        "10px 4px 4px rgba(0, 0, 0, 0.8)",
                                    borderRadius: "40px",
                                    marginTop: "18px",
                                    paddingLeft: "40px",
                                }}
                            >
                                <VStack sx={{ marginRight: "40px" }}>
                                    <Img src={BatteryIcon} w="100px"></Img>
                                    <Text
                                        sx={{
                                            fontSize: "40px",
                                            fontWeight: 400,
                                        }}
                                    >
                                        battery
                                    </Text>
                                </VStack>
                                <Box
                                    sx={{
                                        width: "355px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: "2px dashed #FFF761",
                                            height: "85px",
                                            position: "relative",
                                        }}
                                    >
                                        <Input
                                            ref={inputBatteryRef}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                fontSize: "40px",
                                                textAlign: "center",
                                                ":focus": {
                                                    border: "none",
                                                    boxShadow: "none",
                                                },
                                            }}
                                            placeholder="0"
                                            value={batteryValue}
                                            onChange={(e) => {
                                                handleBatteryValue(
                                                    e.target.value,
                                                );
                                            }}
                                            onBlur={() => {
                                                handleBatteryBlur();
                                            }}
                                            onKeyUp={(e) => {
                                                if (e.key === "Enter") {
                                                    inputBatteryRef?.current?.blur();
                                                }
                                            }}
                                        />
                                        {!!batteryError && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    position: "absolute",
                                                    bottom: "-10px",
                                                    left: "0",
                                                    width: "100%",
                                                }}
                                            >
                                                <Img
                                                    src={WarnIcon}
                                                    sx={{
                                                        height: "40px",
                                                    }}
                                                ></Img>
                                                <Text
                                                    sx={{
                                                        color: "#FF2A0C",

                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {batteryError}
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                    <Slider
                                        aria-label="slider-ex-1"
                                        value={batterySlider}
                                        sx={{
                                            height: "41px",
                                            marginTop: "11px",
                                        }}
                                        onChange={(e) => {
                                            handleBatterySlider(e);
                                        }}
                                    >
                                        <SliderTrack
                                            height={"33px"}
                                            sx={{
                                                background:
                                                    "rgba(217, 217, 217, 0.8)",
                                                borderRadius: "20px",
                                                border: "2px solid #E8EF41",
                                            }}
                                        >
                                            <SliderFilledTrack
                                                sx={{
                                                    background: "#FFF761",
                                                    borderRadius: "20px",
                                                }}
                                            />
                                        </SliderTrack>
                                    </Slider>
                                    <HStack
                                        sx={{ justifyContent: "space-between" }}
                                    >
                                        {[25, 50, 75, 100].map((item) => {
                                            return (
                                                <Box
                                                    key={item}
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        handleBatterySlider(
                                                            item,
                                                        );
                                                    }}
                                                >
                                                    <Box
                                                        key={item}
                                                        sx={{
                                                            width: "80px",
                                                            height: "12px",
                                                            background:
                                                                batterySlider >=
                                                                item
                                                                    ? "#FFF761"
                                                                    : "#D9D9D9",
                                                        }}
                                                    ></Box>
                                                    <Text
                                                        textAlign={"center"}
                                                        fontSize="20px"
                                                        color="#BCBBBE"
                                                    >
                                                        {item}%
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </HStack>
                                    {/* <HStack
                                        justifyContent={"flex-end"}
                                        sx={{ marginTop: "2px" }}
                                    >
                                        <Text
                                            sx={{
                                                color: "#FFF761",
                                                fontSize: "20px",
                                            }}
                                        >
                                            100
                                        </Text>
                                        <Text
                                            sx={{
                                                color: "#ABABAB",
                                                fontSize: "20px",
                                            }}
                                        >
                                            Cap
                                        </Text>
                                    </HStack> */}
                                </Box>
                            </HStack>
                            <HStack
                                sx={{
                                    marginTop: "11px",
                                }}
                            >
                                <Box
                                    sx={{
                                        background: "rgba(255, 255, 255, 0.2)",
                                        border: "1px solid #FFFFFF",
                                        borderRadius: "10px",
                                        width: "42px",
                                        height: "37px",
                                    }}
                                >
                                    <Text
                                        sx={{
                                            fontSize: "24px",
                                            fontWeight: 600,
                                            textAlign: "center",
                                        }}
                                    >
                                        B
                                    </Text>
                                </Box>
                                <Text
                                    sx={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Focus on the battery load input
                                </Text>
                            </HStack>

                            {/* 玩游戏按钮 */}
                            <SubmitButton
                                isLoading={loading}
                                loadingText="Playing"
                                style={{ margin: "15px 0 0 0" }}
                                onClick={handlePlayGame}
                            >
                                Play
                            </SubmitButton>
                        </Box>
                    </Box>
                    <Airplane
                        level={gameLevel}
                        tokenId={tokenId}
                        fuelBalance={fuelBalance}
                        batteryBalance={batteryBalance}
                    ></Airplane>
                </HStack>
            </Box>
        </Box>
    );
};

export default Resource;
