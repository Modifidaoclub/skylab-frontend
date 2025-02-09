import {
    Box,
    HStack,
    Img,
    Text,
    Image,
    VStack,
    useClipboard,
} from "@chakra-ui/react";
import React, {
    ReactElement,
    Fragment,
    useState,
    useEffect,
    useRef,
} from "react";
import { css } from "@emotion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper";
import { Contract } from "ethers-multicall";
import TournamentDivider from "../../assets/tournament-divider.svg";
import RoundWinner from "./assets/round-winner.svg";
import Apr from "./assets/apr.svg";
import SKYLABTOURNAMENT_ABI from "@/skyConstants/abis/SkylabTournament.json";
import TRAILBLAZERLEADERSHIP_ABI from "@/skyConstants/abis/TrailblazerLeadershipDelegation.json";
import RoundTime from "@/skyConstants/roundTime";
import CopyIcon from "./assets/copy.svg";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import {
    skylabTournamentAddress,
    trailblazerLeadershipDelegationAddress,
} from "@/hooks/useContract";
import { getMetadataImg } from "@/utils/ipfsImg";
import { shortenAddress } from "@/utils";
import Loading from "../Loading";
import CloseIcon from "./assets/close-icon.svg";
import useSkyToast from "@/hooks/useSkyToast";
import { useMultiProvider } from "@/hooks/useMultiContract";
import { tournamentChainId } from "@/pages/Activities";

const SwiperSlideContent = ({
    loadData,
    idLevelLoading,
    list,
    round,
    childLoading,
}: {
    childLoading: boolean;
    loadData: boolean;
    idLevelLoading: boolean;
    list: any;
    round: number;
}) => {
    const scrollRef = useRef(null);
    const [copyText, setCopyText] = useState("");
    const { value, onCopy } = useClipboard(copyText);
    const rewardList: any = RoundTime[round]?.rewardList || [];
    const toast = useSkyToast();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(childLoading);

    useEffect(() => {
        if (!value) {
            return;
        }

        onCopy();
        toast("Copy address success");
    }, [value]);

    const ethcallProvider = useMultiProvider(tournamentChainId);

    const handleGetRound = async () => {
        setLoading(true);
        try {
            const tournamentContract = new Contract(
                skylabTournamentAddress[tournamentChainId],
                SKYLABTOURNAMENT_ABI,
            );
            const length = list.length;
            console.time("leaderboard");
            const p = [];
            for (let j = 0; j < length; j++) {
                p.push(tournamentContract.tokenURI(list[j].tokenId));
                p.push(tournamentContract.ownerOf(list[j].tokenId));
                p.push(tournamentContract.aviationPoints(list[j].tokenId));
            }
            const tempRes = await ethcallProvider.all(p);
            console.timeEnd("leaderboard");
            const ares: any = [];
            for (let j = 0; j < length; j++) {
                ares.push({
                    img: getMetadataImg(tempRes[j * 3]),
                    owner: tempRes[j * 3 + 1],
                    point: tempRes[j * 3 + 2].toNumber(),
                });
            }
            const finalRes = list.map((cItem: any, cIndex: number) => {
                return {
                    ...cItem,
                    ...ares[cIndex],
                };
            });
            setData(finalRes);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const handleScrollUp = () => {
        if (!scrollRef?.current) {
            return;
        }

        const scrollHeight = Math.round(scrollRef.current.scrollHeight / 10);

        if (
            scrollHeight + scrollRef.current.scrollTop >=
            scrollRef.current.scrollHeight
        ) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        } else {
            scrollRef.current.scrollTo({
                top: (scrollRef.current.scrollTop += scrollHeight),
                behavior: "smooth",
            });
        }
    };
    const handleScrollDown = () => {
        if (!scrollRef?.current) {
            return;
        }

        const scrollHeight = Math.round(scrollRef.current.scrollHeight / 10);

        if (
            scrollHeight + scrollRef.current.scrollTop >=
            scrollRef.current.scrollHeight
        ) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        } else {
            scrollRef.current.scrollTo({
                top: (scrollRef.current.scrollTop += scrollHeight),
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        if (!ethcallProvider || list.length === 0 || !loadData) {
            return;
        }
        handleGetRound();
    }, [ethcallProvider, list, loadData]);

    useEffect(() => {
        const keyboardListener = (event: KeyboardEvent) => {
            const key = event.key;
            switch (key) {
                case "ArrowDown":
                    handleScrollDown();
                    break;

                case "ArrowUp":
                    handleScrollUp();
                    break;
            }
        };
        document.addEventListener("keydown", keyboardListener);

        return () => {
            document.removeEventListener("keydown", keyboardListener);
        };
    }, []);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                padding: 0,
                zIndex: 110,
            }}
        >
            <Box
                sx={{
                    width: "90%",
                    height: "100%",
                    position: "absolute",
                    overflow: "visible",
                    left: "5vw",
                    background: "rgba(217, 217, 217, 0.2)",
                    border: "3px solid #FFF761",
                    backdropFilter: "blur(7.5px)",
                    borderRadius: "0.8333vw",
                }}
            >
                {loading || idLevelLoading ? (
                    <Loading></Loading>
                ) : (
                    <>
                        <VStack
                            w="36vw"
                            height="71.5vh"
                            pos="absolute"
                            left="7vw"
                            top="6vh"
                            fontFamily="Orbitron"
                            fontWeight="900"
                            fontSize="2.5vw"
                            color="black"
                        >
                            <Box w="34vw">
                                <Img
                                    src={RoundWinner}
                                    pos="relative"
                                    top={0}
                                    left="0"
                                    width="100%"
                                ></Img>
                                <Text
                                    textAlign="center"
                                    w="100%"
                                    paddingTop="5"
                                    zIndex={999}
                                    pos="absolute"
                                    left="0"
                                    top="0"
                                >
                                    Round {round} Winner
                                </Text>
                            </Box>
                            <Box style={{ marginTop: "-3.125vw" }}></Box>
                            <Box
                                flex={1}
                                overflowY="auto"
                                css={css`
                                    &::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}
                            >
                                {rewardList.length == 2 && (
                                    <HStack
                                        justifyContent="center"
                                        sx={{ height: "100%" }}
                                    >
                                        <WinnerItem
                                            w="9.5vw"
                                            bg="rgba(0, 0, 0, 0.6)"
                                            border="4px solid #FFF761"
                                            address={rewardList[0].address}
                                            img={rewardList[0].img}
                                            fontSize="1.25vw"
                                        ></WinnerItem>
                                        <WinnerItem
                                            w="9.5vw"
                                            bg="rgba(0, 0, 0, 0.6)"
                                            border="4px solid #FFF761"
                                            address={rewardList[1].address}
                                            img={rewardList[1].img}
                                            fontSize="1.25vw"
                                        ></WinnerItem>
                                    </HStack>
                                )}
                                <Text
                                    sx={{
                                        fontSize: "1.25vw",
                                        color: "#fff",
                                        marginTop: "2.6042vw",
                                    }}
                                >
                                    {rewardList.length === 0 &&
                                        `No data yet, please wait for Round ${round} to end.`}
                                </Text>
                            </Box>
                            <Box w="34vw" pos="relative">
                                <Img
                                    src={Apr}
                                    pos="relative"
                                    top={0}
                                    left="0"
                                    width="100%"
                                ></Img>
                                <Text
                                    textAlign="center"
                                    w="100%"
                                    paddingTop="5"
                                    zIndex={999}
                                    pos="absolute"
                                    left="0"
                                    top="0"
                                >
                                    2023 {RoundTime[round]?.endTime}
                                </Text>
                            </Box>
                        </VStack>
                        <Box
                            fontFamily="Orbitron"
                            fontWeight={500}
                            fontSize="1.25vw"
                            color="#BCBBBE"
                            pos="absolute"
                            right="5.2083vw"
                            w="36vw"
                            top="3vh"
                        >
                            <Text>Leaderboard</Text>
                            <VStack
                                spacing="0.2083vw"
                                pos="absolute"
                                overflowY="auto"
                                height="74vh"
                                bg="rgba(0, 0, 0, 0.6)"
                                border="2px solid #FFF761"
                                borderRadius="1.0417vw"
                                padding="1.5625vw 0 "
                                width={"36vw"}
                                css={css`
                                    &::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}
                                ref={scrollRef}
                            >
                                {data.map((item: any, index: number) => (
                                    <Fragment key={index}>
                                        <HStack w="100%" spacing="1.5vw">
                                            <Text
                                                w="4.1667vw"
                                                textAlign="right"
                                                fontFamily="Orbitron"
                                                color={
                                                    index < 3
                                                        ? "#FFF761"
                                                        : "white"
                                                }
                                                fontSize="2.5vw"
                                                fontWeight="500"
                                            >
                                                {index + 1}
                                            </Text>
                                            <Box
                                                w="4.6875vw"
                                                h="4.6875vw"
                                                boxShadow={
                                                    index < 3
                                                        ? "0vw 0vw 0.5208vw #FFF761"
                                                        : undefined
                                                }
                                                bg={
                                                    index < 3
                                                        ? "radial-gradient(50% 50% at 50% 50%, #7D7144 0%, #000000 100%)"
                                                        : "#191823"
                                                }
                                                border={
                                                    index < 3
                                                        ? "4px solid #FFC110"
                                                        : "1px solid #FFFFFF"
                                                }
                                                borderRadius="0.5208vw"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Img
                                                    src={item.img}
                                                    w="4.6875vw"
                                                    h="4.6875vw"
                                                />
                                            </Box>
                                            <VStack
                                                spacing="4px"
                                                alignItems={"flex-start"}
                                            >
                                                <Text
                                                    fontFamily="Orbitron"
                                                    color="white"
                                                    fontSize="1.4583vw"
                                                    fontWeight="500"
                                                >
                                                    Level {item.level} Point{" "}
                                                    {item.point}
                                                </Text>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                    onClick={() => {
                                                        setCopyText(item.owner);
                                                    }}
                                                    cursor={"pointer"}
                                                >
                                                    <Text
                                                        className="copyAddress"
                                                        fontFamily="Orbitron"
                                                        color="white"
                                                        fontSize="1.25vw"
                                                        fontWeight="500"
                                                        marginRight={"0.5208vw"}
                                                    >
                                                        owner:{" "}
                                                        {shortenAddress(
                                                            item.owner,
                                                            4,
                                                            4,
                                                        )}
                                                    </Text>
                                                    <Image
                                                        src={CopyIcon}
                                                        className="copyAddress"
                                                    ></Image>
                                                </Box>
                                            </VStack>
                                        </HStack>
                                        {index !== data.length - 1 ? (
                                            <Img
                                                src={TournamentDivider}
                                                w="100%"
                                            />
                                        ) : null}
                                    </Fragment>
                                ))}
                            </VStack>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

const WinnerItem = ({
    w,
    bg = "rgba(255, 255, 255, 0.5)",
    border = "4px solid #fff",
    address,
    fontSize = "0.8333vw",
    img,
}: {
    w?: string;
    bg?: string;
    border?: string;
    address?: string;
    fontSize?: string;
    img?: string;
}) => {
    return (
        <VStack>
            <Box w={w} h={w} bg={bg} border={border} borderRadius="1.0417vw">
                <Img src={img} w={w} marginLeft="0.5208vw"></Img>
            </Box>
            <Text color="#fff" fontSize={fontSize} textAlign="center">
                {shortenAddress(address)}
            </Text>
        </VStack>
    );
};

interface ChildProps {
    currentRound: number;
    onNextRound: (nextStep: number) => void;
}

export const Leaderboard = ({ onNextRound }: ChildProps): ReactElement => {
    const [controlledSwiper, setControlledSwiper] = useState(null);
    const [childLoading] = useState(true);

    const { account } = useActiveWeb3React();
    const currentRound = 1;
    const recocrdRound = 1;
    const lastTokenId: any = 122;

    const [selectRound, setSelectRound] = useState(currentRound);

    const [tokenIdList, setTokenIdList] = useState<any[]>([[]]);
    const [idLevelLoading, setIdLevelLoading] = useState(false);

    const ethcallProvider = useMultiProvider(tournamentChainId);

    const handleGetTokenIdList = async () => {
        setIdLevelLoading(true);

        // 取消报错
        if (lastTokenId === 0) {
            setIdLevelLoading(false);
            return;
        }

        const tournamentContract = new Contract(
            skylabTournamentAddress[tournamentChainId],
            SKYLABTOURNAMENT_ABI,
        );

        const trailblazerLeadershipDelegationContract = new Contract(
            trailblazerLeadershipDelegationAddress[tournamentChainId],
            TRAILBLAZERLEADERSHIP_ABI,
        );

        const p = [];

        // 请求所有轮次的排行榜tokenId信息
        for (let i = 1; i <= currentRound; i++) {
            if (i === recocrdRound) {
                p.push(
                    trailblazerLeadershipDelegationContract.leaderboardInfo(
                        recocrdRound,
                        lastTokenId,
                    ),
                );
            } else {
                p.push(tournamentContract.leaderboardInfo(i));
            }
        }
        const infos = await ethcallProvider.all(p);
        setTokenIdList(
            infos.map((item) => {
                return item
                    .map((cItem: any) => {
                        return {
                            level: cItem.level.toNumber(),
                            tokenId: cItem.tokenId.toNumber(),
                        };
                    })
                    .filter((cItem: any) => {
                        return cItem.level !== 0;
                    })
                    .sort((a: any, b: any) => {
                        return b.level - a.level;
                    });
            }),
        );
        setIdLevelLoading(false);
    };

    const handleNextRound = () => {
        if (!!account) {
            onNextRound(2);
        } else {
            onNextRound(1);
        }
    };

    const handleTurnLeft = () => {
        if (controlledSwiper) {
            controlledSwiper.slidePrev();
        }
    };

    const handleTurnRight = () => {
        if (controlledSwiper) {
            controlledSwiper.slideNext();
        }
    };

    useEffect(() => {
        if (!ethcallProvider) {
            return;
        }
        handleGetTokenIdList();
    }, [ethcallProvider]);

    useEffect(() => {
        const keyboardListener = (event: KeyboardEvent) => {
            const key = event.key;
            switch (key) {
                case "ArrowLeft":
                    handleTurnLeft();
                    break;
                case "ArrowRight":
                    handleTurnRight();
                    break;
                case " ":
                    handleNextRound();
                    break;
            }
        };
        document.addEventListener("keydown", keyboardListener);

        return () => {
            document.removeEventListener("keydown", keyboardListener);
        };
    }, [controlledSwiper]);

    return (
        <Box
            w="100vw"
            h="100vh"
            overflow="hidden"
            pos="absolute"
            id="background"
            onClick={(e: any) => {
                if (
                    e.target.className.includes("copyAddress") ||
                    e.target.className.includes("swiper-button-next") ||
                    e.target.className.includes("swiper-button-prev")
                ) {
                    return;
                }

                handleNextRound();
            }}
            sx={{
                ".swiper-pagination": {
                    width: "auto",
                    left: "50%",
                    maxHeight: "1.7188vw",
                    transform: "translateX(-50%)",
                    background: "rgba(217, 217, 217, 0.1)",
                    borderRadius: "2.0833vw",
                    padding: currentRound > 1 ? "0vw 0.8333vw" : "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: currentRound ? "1.25vw" : "auto",
                    ".swiper-pagination-bullet": {
                        width: "0.4688vw",
                        height: "0.4688vw",
                    },

                    ".swiper-pagination-bullet.swiper-pagination-bullet-active":
                        {
                            background: "#D9D9D9",
                        },
                },

                ".swiper-button-next": {
                    fontSize: "2.9167vw",
                    color: "#F5CA5C",
                    right: "2%",
                    zIndex: 100,
                },
                ".swiper-button-next:after": {
                    fontSize: "2.9167vw",
                    color: "#F5CA5C",
                },
                ".swiper-button-prev": {
                    fontSize: "2.9167vw",
                    color: "#F5CA5C",
                    left: "2%",
                    zIndex: 100,
                },
                ".swiper-button-prev:after": {
                    fontSize: "2.9167vw",
                    color: "#F5CA5C",
                },
            }}
        >
            <Image
                cursor={"pointer"}
                src={CloseIcon}
                bottom="2vh"
                right="5vw"
                pos={"absolute"}
                zIndex={111}
                onClick={(e: any) => {
                    if (!!account) {
                        onNextRound(2);
                    } else {
                        onNextRound(1);
                    }
                    return;
                }}
            />

            <Swiper
                navigation={true}
                pagination={true}
                onSwiper={setControlledSwiper}
                modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                style={{
                    width: "100vw",
                    height: "97vh",
                    position: "relative",
                    left: "0vw",
                    borderRadius: "0.8333vw",
                    padding: 0,
                    zIndex: 8,
                    top: "0vh",
                }}
                initialSlide={currentRound}
                onSlideChange={(swiper) => {
                    const round = swiper.activeIndex + 1;
                    setSelectRound(round);
                }}
            >
                {tokenIdList.map((item, index) => {
                    const round = index + 1;
                    return (
                        <SwiperSlide
                            key={index}
                            style={{
                                background: "transparent",
                                height: "84vh",
                                overflow: "visible",
                                zIndex: 110,
                                top: "8vh",
                            }}
                        >
                            <SwiperSlideContent
                                idLevelLoading={idLevelLoading}
                                loadData={selectRound === round}
                                list={item.slice(0, 50)}
                                childLoading={childLoading}
                                round={round}
                            ></SwiperSlideContent>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            <Text
                sx={{
                    position: "absolute",
                    bottom: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "1.25vw",
                    fontWeight: "bold",
                }}
            >
                Tap anywhere to continue
            </Text>
        </Box>
    );
};
