import { Box, Image, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Bg from "./assets/settlement-bg.png";
import GardenIcon from "./assets/garden-icon.png";
import BackIcon from "./assets/back-arrow-home.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { Info, MyNewInfo, useGameContext } from "@/pages/TacToe";
import { GameState } from ".";
import UpIcon from "./assets/up-icon.svg";
import DownIcon from "./assets/down-icon.svg";
import Loading from "../Loading";
import Playback from "./assets/playback.svg";
import { shortenAddressWithout0x } from "@/utils";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import { aviationImg } from "@/utils/aviationImg";
import { levelRanges } from "@/utils/level";
import RequestNextButton from "../RequrestNextButton";
import MyPilot from "../Tournament/MyPilot";
import MileageIcon from "@/components/Tournament/assets/mileage-icon.svg";
import PilotIcon from "@/components/Tournament/assets/pilot-icon.svg";
import RightArrowBlack from "@/components/Tournament/assets/right-arrow-black.svg";
import { PrimaryButton } from "../Button/Index";
import qs from "query-string";

const PilotInfo = ({ myInfo }: { myInfo: Info }) => {
    const { activePilot } = useGameContext();
    const { account } = useActiveWeb3React();
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                marginTop: "1.0417vw",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-end",
                }}
            >
                <MyPilot
                    img={activePilot?.img}
                    showSupport={activePilot.owner !== account}
                    sx={{
                        width: "5.7292vw !important",
                        height: "5.7292vw !important",
                        marginRight: "1.0417vw",
                    }}
                ></MyPilot>
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            src={MileageIcon}
                            sx={{
                                width: "2.8646vw",
                                height: "2.8646vw",
                                marginRight: "0.4167vw",
                            }}
                        ></Image>
                        <Box
                            sx={{
                                width: "3.6458vw",
                                height: "1.5625vw",
                                borderRadius: "1.3542vw",
                                background: "rgba(188, 187, 190, 0.50)",
                                color: "#FFF",
                                textAlign: "center",
                                fontSize: "1.0417vw",
                                lineHeight: "1.5625vw",
                            }}
                        >
                            {activePilot.xp}
                        </Box>
                        <Text
                            sx={{
                                color: "#8FFFF9",
                                textShadow:
                                    "0vw 0.2083vw 0.2083vw rgba(0, 0, 0, 0.25)",
                                fontFamily: "Orbitron",
                                fontSize: "1.0417vw",
                                fontWeight: 700,
                                marginLeft: "0.5208vw",
                            }}
                        >
                            +{myInfo.level * myInfo.move}
                        </Text>
                    </Box>
                    <Text
                        sx={{
                            color: "#FDDC2D",
                            fontSize: "0.8333vw",
                        }}
                    >
                        Mileage
                    </Text>
                </Box>
            </Box>

            {!activePilot?.img && (
                <Box>
                    <PrimaryButton
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(255, 255, 255, 0.50)",
                            borderRadius: "0.5208vw",
                            marginTop: "0.5208vw",
                            width: "5.7292vw",
                            height: "1.7708vw",
                            padding: "0 0.4167vw",
                            justifyContent: "space-between",
                        }}
                        onClick={() => {
                            navigate("/activities?step=currentPilot", {
                                replace: true,
                            });
                        }}
                    >
                        <Image
                            src={PilotIcon}
                            sx={{
                                width: "1.0417vw",
                            }}
                        ></Image>
                        <Text
                            sx={{
                                fontSize: "0.8333vw",
                                color: "#4A4A4A",
                            }}
                        >
                            Pilot
                        </Text>
                        <Box
                            sx={{
                                borderLeft: "1px solid rgba(96, 96, 96, 0.30)",
                                paddingLeft: "2px",
                            }}
                        >
                            <Image
                                src={RightArrowBlack}
                                sx={{
                                    width: "0.8333vw",
                                }}
                            ></Image>
                        </Box>
                    </PrimaryButton>
                    <Text
                        sx={{
                            fontSize: "0.8333vw",
                            width: "18.75vw",
                            marginTop: "0.5208vw",
                            fontStyle: "italic",
                        }}
                    >
                        Set an active pilot to not have your hard-earned Mileage
                        from games go wasted.
                    </Text>
                </Box>
            )}
        </Box>
    );
};

// calculate level and upgrade progress
function calculateLevelAndProgress(currentPoint: number, win: boolean = true) {
    if (currentPoint === 0) {
        return 0;
    }

    let nextPoint = 0;
    let prePoint = 0;

    if (win) {
        for (let i = 0; i < levelRanges.length; i++) {
            if (currentPoint <= levelRanges[i]) {
                nextPoint = levelRanges[i];
                prePoint = levelRanges[i - 1];
                break;
            }
        }
    } else {
        for (let i = levelRanges.length - 1; i >= 0; i--) {
            if (currentPoint >= levelRanges[i]) {
                nextPoint = levelRanges[i + 1];
                prePoint = levelRanges[i];
                break;
            }
        }
    }

    const progress = ((currentPoint - prePoint) / (nextPoint - prePoint)) * 100;

    return progress.toFixed(0);
}

const WinResult = ({
    myInfo,
    myNewInfo,
}: {
    myInfo: Info;
    myNewInfo: MyNewInfo;
}) => {
    const [highlight, rightPlaneImg, rightPlaneLevel] = useMemo(() => {
        if (myNewInfo.level === myInfo.level) {
            return [false, aviationImg(myInfo.level + 1), myInfo.level + 1];
        } else if (myNewInfo.level > myInfo.level) {
            return [true, aviationImg(myNewInfo.level), myNewInfo.level];
        }
    }, [myNewInfo.level, myInfo.level]);

    return (
        <Box>
            <Text
                sx={{
                    fontSize: "2.5vw",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#FDDC2D",
                }}
            >
                YOU WIN
            </Text>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box>
                    <Image
                        src={aviationImg(myInfo.level)}
                        sx={{
                            width: "15.625vw",
                            height: "15.625vw",
                            opacity: highlight ? "0.5" : "1",
                        }}
                    ></Image>
                    <Text sx={{ fontSize: "1.875vw", textAlign: "center" }}>
                        Lvl.{myInfo.level}
                    </Text>
                </Box>

                <Image src={UpIcon} sx={{ margin: "0 4.1667vw" }}></Image>
                <Box>
                    <Image
                        src={rightPlaneImg}
                        sx={{
                            width: "15.625vw",
                            height: "15.625vw",
                            opacity: highlight ? "1" : "0.5",
                        }}
                    ></Image>
                    <Text sx={{ fontSize: "1.875vw", textAlign: "center" }}>
                        Lvl.{rightPlaneLevel}
                    </Text>
                </Box>
            </Box>
            <Box
                sx={{
                    width: "34.6354vw",
                    margin: "0 auto",
                }}
            >
                <Text
                    sx={{
                        textAlign: "right",
                        fontSize: "1.25vw",
                    }}
                >
                    {myInfo.point} pt +{" "}
                    <span style={{ color: "rgba(253, 220, 45, 1)" }}>
                        {myNewInfo.point - myInfo.point} pt
                    </span>{" "}
                    / {myNewInfo.point} pt
                </Text>
                <Box
                    sx={{
                        height: "1.7188vw",
                        border: "0.1042vw solid #FFF",
                        borderRadius: "1.0417vw",
                        padding: "0.3125vw",
                    }}
                >
                    <Box
                        sx={{
                            width:
                                calculateLevelAndProgress(myNewInfo.point) +
                                "%",
                            height: "100%",
                            background: "#fff",
                            borderRadius: "1.0417vw",
                        }}
                    ></Box>
                </Box>
            </Box>
        </Box>
    );
};

const LoseResult = ({
    myInfo,
    myNewInfo,
}: {
    myInfo: Info;
    myNewInfo: MyNewInfo;
}) => {
    return (
        <Box>
            <Text
                sx={{
                    fontSize: "2.5vw",
                    fontWeight: "bold",
                    textAlign: "center",
                }}
            >
                YOU LOSE
            </Text>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box>
                    <Image
                        src={aviationImg(myNewInfo.level)}
                        sx={{
                            width: "15.625vw",
                            height: "15.625vw",
                        }}
                    ></Image>
                    <Text sx={{ fontSize: "1.875vw", textAlign: "center" }}>
                        Lvl.{myNewInfo.level}
                    </Text>
                </Box>
                <Image src={DownIcon} sx={{ margin: "0 4.1667vw" }}></Image>
                <Box>
                    <Image
                        src={myInfo.img}
                        sx={{
                            width: "15.625vw",
                            height: "15.625vw",
                            opacity: "0.5",
                        }}
                    ></Image>
                    <Text sx={{ fontSize: "1.875vw", textAlign: "center" }}>
                        Lvl.{myInfo.level}
                    </Text>
                </Box>
            </Box>
            <Box
                sx={{
                    width: "34.6354vw",
                    margin: "0 auto",
                }}
            >
                <Text
                    sx={{
                        textAlign: "right",
                        fontSize: "1.25vw",
                    }}
                >
                    {myInfo.point} pt -{" "}
                    <span style={{ color: "rgba(253, 220, 45, 1)" }}>
                        {myInfo.point - myNewInfo.point} pt
                    </span>{" "}
                    / {myNewInfo.point} pt
                </Text>
                <Box
                    sx={{
                        height: "1.7188vw",
                        border: "0.1042vw solid #FFF",
                        borderRadius: "1.0417vw",
                        padding: "0.3125vw",
                    }}
                >
                    <Box
                        sx={{
                            width:
                                calculateLevelAndProgress(
                                    myNewInfo.point,
                                    false,
                                ) + "%",
                            height: "100%",
                            background: "#fff",
                            borderRadius: "1.0417vw",
                        }}
                    ></Box>
                </Box>
            </Box>
        </Box>
    );
};

const SettlementPage = ({}) => {
    const { chainId } = useActiveWeb3React();
    const navigate = useNavigate();
    const { search } = useLocation();
    const params = qs.parse(search) as any;
    const istest = params.testflight === "true";
    const { myGameInfo, myInfo, myNewInfo, bidTacToeGameAddress } =
        useGameContext();

    const win = useMemo(() => {
        return [
            GameState.WinByConnecting,
            GameState.WinBySurrender,
            GameState.WinByTimeout,
            GameState.WinByGridCount,
        ].includes(myGameInfo.gameState);
    }, [myGameInfo.gameState]);

    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                background: `url(${Bg}) no-repeat center center`,
                backgroundSize: "cover",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                fontFamily: "Orbitron",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    position: "absolute",
                    left: "0",
                    top: "0",
                    cursor: "pointer",
                }}
            >
                <Box
                    onClick={() =>
                        navigate("/activities?step=2", {
                            replace: true,
                        })
                    }
                    sx={{
                        display: "flex",
                        marginRight: "1.0417vw",
                    }}
                >
                    <Image
                        src={GardenIcon}
                        sx={{
                            width: "5.4167vw",
                        }}
                    ></Image>
                    <Image
                        src={BackIcon}
                        sx={{
                            width: "2.6563vw",
                        }}
                    ></Image>
                </Box>
                <Image
                    src={Playback}
                    sx={{
                        cursor: "pointer",
                        width: "4.4vw",
                    }}
                    onClick={() => {
                        navigate(
                            `/tactoe/playback?gameAddress=${bidTacToeGameAddress}&burner=${shortenAddressWithout0x(
                                myInfo.burner,
                            )}&chainId=${chainId}`,
                            {
                                replace: true,
                            },
                        );
                    }}
                ></Image>
            </Box>

            <Box
                sx={{
                    position: "relative",
                }}
            >
                {myNewInfo ? (
                    <>
                        {win ? (
                            <WinResult
                                myInfo={myInfo}
                                myNewInfo={myNewInfo}
                            ></WinResult>
                        ) : (
                            <LoseResult
                                myInfo={myInfo}
                                myNewInfo={myNewInfo}
                            ></LoseResult>
                        )}

                        <PilotInfo myInfo={myInfo}></PilotInfo>
                        {istest && (
                            <Text
                                sx={{
                                    marginTop: "3.125vw",
                                    fontSize: "1.25vw",
                                }}
                            >
                                Your playtest aviation is temporary, join
                                tournament to keep your future wins.
                            </Text>
                        )}
                        <RequestNextButton
                            sx={{
                                margin: "2.0833vw auto",
                            }}
                            onClick={() => {
                                window.open(
                                    "https://twitter.com/skylabHQ",
                                    "_blank",
                                );
                            }}
                        ></RequestNextButton>
                    </>
                ) : (
                    <Loading></Loading>
                )}
            </Box>
        </Box>
    );
};

export default SettlementPage;
