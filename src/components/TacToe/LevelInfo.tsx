import { Info, useGameContext } from "@/pages/TacToe";
import { Box, Text, Image } from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";
import LevelUpIcon from "./assets/level-up.svg";
import LevelDownIcon from "./assets/level-down.svg";
import useCountDown from "react-countdown-hook";
import { getLevel } from "@/utils/level";

export const PlaneImg = ({
    detail,
    flip,
}: {
    detail: Info;
    flip?: boolean;
}) => {
    return (
        <Box>
            <Image
                src={detail.img}
                sx={{
                    width: "280px",
                    height: "280px",
                    transform: flip ? "scaleX(-1)" : "",
                    /*兼容IE*/
                    filter: "FlipH",
                }}
            ></Image>
            <Box
                sx={{
                    textAlign: "center",
                }}
            >
                <Text
                    sx={{
                        fontSize: "16px",
                        fontWeight: "bold",
                    }}
                >
                    Level {detail.level}{" "}
                </Text>
                <Text
                    sx={{
                        fontSize: "16px",
                        fontWeight: "bold",
                    }}
                >
                    {detail.point} pt
                </Text>
            </Box>
        </Box>
    );
};

const LevelInfo = ({}) => {
    const { myInfo, opInfo, onStep } = useGameContext();
    const [timeLeft, { start }] = useCountDown(5000, 1000);

    useEffect(() => {
        start();
    }, []);

    const [
        myWinPoint,
        myWinNewLevel,
        myWinNewPoint,
        myLosePoint,
        myLoseNewLevel,
        myLoseNewPoint,
    ] = useMemo(() => {
        let winPoint = 0;
        let losePoint = 0;
        if (opInfo.level % 2 === 0) {
            winPoint = opInfo.level / 2;
        } else {
            winPoint = Math.floor(opInfo.level / 2) + 1;
        }

        if (myInfo.level % 2 === 0) {
            losePoint = myInfo.level / 2;
        } else {
            losePoint = Math.floor(myInfo.level / 2) + 1;
        }

        const myWinPoint = winPoint;
        const myWinNewPoint = myInfo.point + winPoint;
        const myWinNewLevel = getLevel(myWinNewPoint);

        const myLosePoint = losePoint;
        const myLoseNewPoint = myInfo.point - losePoint;
        const myLoseNewLevel = getLevel(myLoseNewPoint);

        return [
            myWinPoint,
            myWinNewLevel,
            myWinNewPoint,
            myLosePoint,
            myLoseNewLevel,
            myLoseNewPoint,
        ];
    }, [myInfo, opInfo]);

    useEffect(() => {
        setTimeout(() => {
            onStep(2);
        }, 5000);
    }, []);

    return (
        <Box
            sx={{
                fontFamily: "Orbitron",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "1vh",
                }}
            >
                <PlaneImg detail={myInfo}></PlaneImg>
                <Text sx={{ fontSize: "48px", margin: "0 30px" }}>VS</Text>
                <PlaneImg detail={opInfo} flip={true}></PlaneImg>
            </Box>
            <Box
                sx={{
                    fontWeight: "bold",
                    marginTop: "10vh",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #fff",
                        paddingBottom: "15px",
                    }}
                >
                    <Text
                        sx={{
                            color: "#FDDC2D",
                            fontSize: "20px",
                            width: "250px",
                        }}
                    >
                        Victory reward
                    </Text>
                    <Text
                        sx={{
                            marginRight: "10px",
                        }}
                    >
                        +{myWinPoint} pt
                    </Text>
                    <Image
                        src={LevelUpIcon}
                        sx={{
                            marginRight: "20px",
                        }}
                    ></Image>
                    <Box sx={{ textAlign: "center" }}>
                        <Text
                            sx={{
                                fontSize: "20px",
                            }}
                        >
                            Level {myWinNewLevel}
                        </Text>
                        <Text>{myWinNewPoint} pt</Text>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "60px",
                        borderBottom: "1px solid #fff",
                        paddingBottom: "15px",
                    }}
                >
                    <Text
                        sx={{
                            color: "#fff",
                            fontSize: "20px",
                            width: "250px",
                        }}
                    >
                        Defeat penalty
                    </Text>
                    <Text
                        sx={{
                            marginRight: "10px",
                        }}
                    >
                        -{myLosePoint} pt
                    </Text>
                    <Image
                        src={LevelDownIcon}
                        sx={{
                            marginRight: "20px",
                        }}
                    ></Image>
                    <Box sx={{ textAlign: "center" }}>
                        <Text
                            sx={{
                                fontSize: "20px",
                            }}
                        >
                            Level {myLoseNewLevel}
                        </Text>
                        <Text>{myLoseNewPoint} pt</Text>
                    </Box>
                </Box>
            </Box>
            <Text
                sx={{ fontSize: "24px", fontWeight: "bold", marginTop: "10vh" }}
            >
                Entering game in 5s
            </Text>
            <Box
                sx={{
                    width: "420px",
                    height: "4px",
                    display: "flex",
                    justifyContent: "flex-end",
                    background: "#616161",
                    marginTop: "8px",
                }}
            >
                <Box
                    sx={{
                        width: (timeLeft / 5000) * 100 + "%",
                        transition: "width 0.5s",
                        height: "4px",
                        background: "#BCBBBE",
                    }}
                ></Box>
            </Box>
        </Box>
    );
};

export default LevelInfo;
