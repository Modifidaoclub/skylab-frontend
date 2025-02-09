import { Box, Button, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "@/components/TacToe/assets/back-arrow.svg";
import Logo from "@/assets/logo.svg";
import BttIcon from "@/assets/btt-icon.png";
import qs from "query-string";
import CircleIcon from "@/components/TacToe/assets/circle.svg";
import XIcon from "@/components/TacToe/assets/x.svg";
import {
    BoardItem,
    initBoard,
    UserMarkIcon,
    UserMarkType,
} from "@/pages/TacToe";
import {
    useMultiProvider,
    useMultiSkylabBidTacToeFactoryContract,
    useMultiSkylabBidTacToeGameContract,
} from "@/hooks/useMultiContract";
import Board from "../TacToe/Board";
import { GameState, getWinState, winPatterns } from "../TacToe";
import { UserCard } from "./UserCard";
import TwLogo from "@/components/TacToe/assets/tw-logo.svg";
import Loading from "../Loading";
import { shortenAddressWithout0x } from "@/utils";
import EarthIcon from "@/components/TacToe/assets/earth.svg";
import ButtonGroup from "./ButtonGroup";
import RightArrow from "@/components/TacToe/assets/right-arrow.svg";
import { aviationImg } from "@/utils/aviationImg";
import { ZERO_DATA } from "@/skyConstants";

interface Info {
    burner?: string;
    address?: string;
    level: number;
    mark: UserMarkType;
    gameState: GameState;
}

const StartJourney = () => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                display: "flex",
                background: "#fff",
                borderRadius: "0.9375vw",
                color: "#000",
                padding: "0.2083vw 0.3125vw",
                fontFamily: "Orbitron",
                cursor: "pointer",
                marginTop: "1.5625vw",
                width: "20.8333vw",
            }}
            onClick={() => {
                navigate("/activities");
            }}
        >
            <Image
                src={BttIcon}
                sx={{ height: "3.8542vw", marginRight: "0.7813vw" }}
            ></Image>
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Text
                        sx={{
                            fontSize: "1.6667vw",
                            fontWeight: "bold",
                            marginRight: "0.7813vw",
                        }}
                    >
                        Bid Tac Toe
                    </Text>
                    <Box
                        sx={{
                            borderLeft: "1px solid #000",
                            paddingLeft: "0.5208vw",
                        }}
                    >
                        <Image
                            src={RightArrow}
                            sx={{ height: "1.6667vw" }}
                        ></Image>
                    </Box>
                </Box>
                <Text sx={{ fontWeight: "bold", fontSize: "1.0417vw" }}>
                    Start your journey
                </Text>
            </Box>
        </Box>
    );
};

const RoundInfo = ({
    currentRound,
    allRound,
}: {
    currentRound: number;
    allRound: number;
}) => {
    return (
        <Box
            sx={{
                borderRadius: "1.0417vw",
                background: "#d9d9d9",
                display: "flex",
                width: "6.875vw",
                alignItems: "center",
                justifyContent: "center",
                margin: "2.6042vw auto 0",
                height: "1.875vw",
            }}
        >
            <Text
                sx={{
                    fontSize: "0.8333vw",
                    color: "#303030",
                }}
            >
                Round {currentRound}
            </Text>
            <Text
                sx={{
                    color: "#616161",
                    fontSize: "0.7292vw",
                }}
            >
                {" "}
                /{allRound}
            </Text>
        </Box>
    );
};

const BttPlayBackPage = () => {
    const navigate = useNavigate();

    const [onlyShow, setOnlyShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [init, setInit] = useState(false);
    const [startPlay, setStartPlay] = useState(false);
    const { search } = useLocation();
    const params = qs.parse(search) as any;
    const ethcallProvider = useMultiProvider(params.chainId);
    const [allSelectedGrids, setAllSelectedGrids] = useState<any[]>([]);
    const [bttGameAddress, setBttGameAddress] = useState("");
    const [currentRound, setCurrentRound] = useState(0);

    const timer = useRef<any>(null);
    const multiSkylabBidTacToeFactoryContract =
        useMultiSkylabBidTacToeFactoryContract(params.chainId);
    const multiSkylabBidTacToeGameContract =
        useMultiSkylabBidTacToeGameContract(bttGameAddress);
    const [burner, setBurner] = useState("");
    const [resultList, setResultList] = useState<BoardItem[]>(initBoard()); // init board
    const [myInfo, setMyInfo] = useState<Info>({
        burner: "",
        address: "",
        level: 0,
        mark: UserMarkType.Empty,
        gameState: GameState.Unknown,
    });
    const [opInfo, setOpInfo] = useState<Info>({
        burner: "",
        level: 0,
        mark: UserMarkType.Empty,
        gameState: GameState.Unknown,
    });

    const gameOver = useMemo(() => {
        return currentRound === allSelectedGrids.length;
    }, [currentRound, allSelectedGrids]);

    const myMark = useMemo(() => {
        if (myInfo.mark === UserMarkType.Circle) {
            if (getWinState(myInfo.gameState) && gameOver) {
                return UserMarkIcon.YellowCircle;
            } else {
                return UserMarkIcon.Circle;
            }
        } else {
            if (getWinState(myInfo.gameState) && gameOver) {
                return UserMarkIcon.YellowCross;
            } else {
                return UserMarkIcon.Cross;
            }
        }
    }, [myInfo, gameOver]);

    const opMark = useMemo(() => {
        if (opInfo.mark === UserMarkType.Circle) {
            if (getWinState(opInfo.gameState) && gameOver) {
                return UserMarkIcon.YellowCircle;
            } else {
                return UserMarkIcon.Circle;
            }
        } else {
            if (getWinState(opInfo.gameState) && gameOver) {
                return UserMarkIcon.YellowCross;
            } else {
                return UserMarkIcon.Cross;
            }
        }
    }, [opInfo]);

    const handleGetGameInfo = async () => {
        if (
            !multiSkylabBidTacToeGameContract ||
            !multiSkylabBidTacToeFactoryContract
        )
            return;

        setLoading(true);
        const params = qs.parse(search) as any;
        const burner = params.burner;

        setBurner(burner);
        const account = params.account;
        const round = params.round;

        const [metadata, boardGrids, player1, player2] =
            await ethcallProvider.all([
                multiSkylabBidTacToeFactoryContract.planeMetadataPerGame(
                    bttGameAddress,
                ),
                multiSkylabBidTacToeGameContract.getGrid(),
                multiSkylabBidTacToeGameContract.player1(),
                multiSkylabBidTacToeGameContract.player2(),
            ]);

        const [player1Bids, player2Bids, player1GameState, player2GameState] =
            await ethcallProvider.all([
                multiSkylabBidTacToeGameContract.getRevealedBids(player1),
                multiSkylabBidTacToeGameContract.getRevealedBids(player2),
                multiSkylabBidTacToeGameContract.gameStates(player1),
                multiSkylabBidTacToeGameContract.gameStates(player2),
            ]);

        const [level1, points1, level2, points2] = metadata;

        const myIsPlayer1 = shortenAddressWithout0x(player1) === burner;

        const player1Info = {
            burner: player1,
            level: level1.toNumber(),
            mark: UserMarkType.Circle,
            gameState: player1GameState.toNumber(),
        };

        const player2Info = {
            burner: player2,
            level: level2.toNumber(),
            mark: UserMarkType.Cross,
            gameState: player2GameState.toNumber(),
        };

        const myInfo = myIsPlayer1
            ? {
                  address: account ?? "",
                  ...player1Info,
              }
            : {
                  address: account ?? "",
                  ...player2Info,
              };

        const opInfo = myIsPlayer1 ? player2Info : player1Info;

        setMyInfo(myInfo);
        setOpInfo(opInfo);

        let index = 0;
        const p = boardGrids
            .map((item: any) => {
                if (item === ZERO_DATA) {
                    return null;
                } else {
                    return multiSkylabBidTacToeGameContract.allSelectedGrids(
                        index++,
                    );
                }
            })
            .filter((item: any) => item !== null);

        const _gridOrder = await ethcallProvider.all(p);

        const _list = initBoard();

        for (let i = 0; i < boardGrids.length; i++) {
            if (boardGrids[i] === ZERO_DATA) {
                _list[i].mark = UserMarkType.Empty;
            } else if (boardGrids[i] === myInfo.burner) {
                _list[i].mark = myInfo.mark;
            } else if (boardGrids[i] === opInfo.burner) {
                _list[i].mark = opInfo.mark;
            }
            _list[i].myValue = myIsPlayer1
                ? player1Bids[i].toNumber()
                : player2Bids[i].toNumber();
            _list[i].opValue = myIsPlayer1
                ? player2Bids[i].toNumber()
                : player1Bids[i].toNumber();
            _list[i].myMark = myInfo.mark;
            _list[i].opMark = opInfo.mark;
        }

        setAllSelectedGrids(
            _gridOrder.map((item: any) => {
                return item.toNumber();
            }),
        );

        if (round && round <= _gridOrder.length) {
            setCurrentRound(round);
        }

        setResultList(_list);
        setLoading(false);
        setInit(true);
    };

    useEffect(() => {
        const params = qs.parse(search) as any;
        if (bttGameAddress === "") {
            setBttGameAddress(params.gameAddress);
            setOnlyShow(params.show === "true");
        } else if (!params.gameAddress) {
            navigate(`/activities`);
        } else if (bttGameAddress != params.gameAddress) {
            navigate(`/activities`);
        }
    }, [search, bttGameAddress]);

    const [showList, myBalance, opBalance, myBid, opBid, myIsNextDrawWinner] =
        useMemo(() => {
            let myBalance = 100,
                opBalance = 100;
            const _list = initBoard();
            if (allSelectedGrids[currentRound] !== undefined) {
                _list[allSelectedGrids[currentRound]].mark =
                    UserMarkType.Square;
            }

            for (let i = 0; i < currentRound; i++) {
                const grid = allSelectedGrids[i];
                _list[grid].mark = resultList[grid].mark;
                _list[grid].myMark = resultList[grid].myMark;
                _list[grid].opMark = resultList[grid].opMark;
                _list[grid].myValue = resultList[grid].myValue;
                _list[grid].opValue = resultList[grid].opValue;
                myBalance -= resultList[grid].myValue;
                opBalance -= resultList[grid].opValue;
            }
            if (currentRound == 0) {
                return [_list, myBalance, opBalance, 0, 0, true];
            }

            if (currentRound === allSelectedGrids.length) {
                const gameState = myInfo.gameState;
                const myIsWin = getWinState(gameState);
                const myIsCircle = myInfo.mark === UserMarkType.Circle;
                const winMark = myIsWin ? myInfo.mark : opInfo.mark;
                let mark;
                if (myIsWin) {
                    mark = myIsCircle
                        ? UserMarkType.YellowCircle
                        : UserMarkType.YellowCross;
                } else {
                    mark = myIsCircle
                        ? UserMarkType.YellowCross
                        : UserMarkType.YellowCircle;
                }

                if (
                    gameState === GameState.WinByConnecting ||
                    gameState === GameState.LoseByConnecting
                ) {
                    for (let i = 0; i < winPatterns.length; i++) {
                        const index0 = winPatterns[i][0];
                        const index1 = winPatterns[i][1];
                        const index2 = winPatterns[i][2];
                        if (
                            _list[index0].mark === winMark &&
                            _list[index1].mark === winMark &&
                            _list[index2].mark === winMark
                        ) {
                            _list[index0].mark = mark;
                            _list[index1].mark = mark;
                            _list[index2].mark = mark;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < _list.length; i++) {
                        if (_list[i].mark === winMark) {
                            _list[i].mark = mark;
                        }
                    }
                }
            }

            const myBid =
                currentRound === 0
                    ? 0
                    : resultList[allSelectedGrids[currentRound - 1]].myValue;
            const opBid =
                currentRound === 0
                    ? 0
                    : resultList[allSelectedGrids[currentRound - 1]].opValue;

            let myIsNextDrawWinner = false;
            if (currentRound === 0) {
                myIsNextDrawWinner =
                    myInfo.mark === UserMarkType.Circle ? true : false;
            } else {
                myIsNextDrawWinner =
                    resultList[currentRound - 1].mark === myInfo.mark
                        ? true
                        : false;
            }

            return [
                _list,
                myBalance,
                opBalance,
                myBid,
                opBid,
                myIsNextDrawWinner,
            ];
        }, [allSelectedGrids, currentRound, resultList, myInfo, opInfo]);

    const handlePreStep = () => {
        if (currentRound === 0) return;
        setCurrentRound(currentRound - 1);
    };
    const handleNextStep = () => {
        if (currentRound >= allSelectedGrids.length) {
            setStartPlay(false);
            return;
        }
        setCurrentRound(currentRound + 1);
    };

    const handleStopPlay = () => {
        setStartPlay(false);
        window.clearTimeout(timer.current);
    };

    const handleStartStep = () => {
        setCurrentRound(0);
    };

    const handleEndStep = () => {
        setCurrentRound(allSelectedGrids.length);
    };

    const handleStartPlay = () => {
        setStartPlay(true);
        handleNextStep();
    };

    const handleAutoPlay = () => {
        if (!startPlay || !init) return;
        timer.current = setTimeout(() => {
            handleNextStep();
        }, 2000);
    };
    useEffect(() => {
        handleGetGameInfo();
    }, [multiSkylabBidTacToeGameContract, multiSkylabBidTacToeFactoryContract]);

    useEffect(() => {
        handleAutoPlay();
    }, [init, startPlay, currentRound]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                justifyContent: "center",
                background: "#303030",
                padding: "0px 4.1667vw 0",
            }}
        >
            <Image
                src={BackIcon}
                onClick={() => navigate("/activities")}
                sx={{
                    position: "absolute",
                    left: "1.0417vw",
                    top: "1.0417vw",
                }}
            ></Image>

            {loading ? (
                <Loading></Loading>
            ) : (
                <>
                    <Box
                        id="share-content"
                        sx={{
                            background: "#303030",
                            maxWidth: "1430px",
                            margin: "0 auto",
                            width: "100%",
                            border: "2px solid #fff",
                            boxShadow:
                                "5px 4px 8px 0px rgba(255, 255, 255, 0.50)",
                            padding: "1.5vh 1.5vw",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                right: "1.5vw",
                                bottom: "1.5vh",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    src={TwLogo}
                                    sx={{ marginRight: "0.2083vw" }}
                                ></Image>
                                <Text
                                    sx={{
                                        fontSize: "1.0417vw",
                                        color: "rgb(172,172,172)",
                                    }}
                                >
                                    @skylabHQ
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: "0.2083vw",
                                }}
                            >
                                <Image
                                    src={EarthIcon}
                                    sx={{ marginRight: "0.2083vw" }}
                                ></Image>
                                <Text
                                    sx={{
                                        fontSize: "1.0417vw",
                                        color: "rgb(172,172,172)",
                                    }}
                                >
                                    skylab.wtf/#/activites
                                </Text>{" "}
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                fontFamily: "Orbitron",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    src={Logo}
                                    sx={{
                                        width: "2.9167vw",
                                        height: "2.9167vw",
                                    }}
                                ></Image>
                                <Text
                                    sx={{
                                        fontSize: "1.25vw",
                                        fontWeight: "700",
                                        marginTop: "0.2604vw",
                                    }}
                                >
                                    Sky Lab
                                </Text>
                            </Box>
                            <Image
                                src={XIcon}
                                sx={{
                                    margin: "0 1.0417vw",
                                    width: "1.0417vw",
                                    height: "1.0417vw",
                                }}
                            ></Image>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    src={BttIcon}
                                    sx={{
                                        width: "2.9167vw",
                                        height: "2.9167vw",
                                    }}
                                ></Image>
                                <Text
                                    sx={{
                                        fontSize: "1.25vw",
                                        fontWeight: "700",
                                        marginTop: "0.2604vw",
                                    }}
                                >
                                    Bid Tac Toe{" "}
                                </Text>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <UserCard
                                markIcon={myMark}
                                level={myInfo.level}
                                status="my"
                                balance={myBalance}
                                bidAmount={myBid}
                                showAdvantageTip={myIsNextDrawWinner}
                                planeUrl={aviationImg(myInfo.level)}
                                gameState={
                                    gameOver
                                        ? myInfo.gameState
                                        : GameState.WaitingForBid
                                }
                            ></UserCard>
                            <Box>
                                <Board list={showList}></Board>
                                <RoundInfo
                                    currentRound={currentRound}
                                    allRound={allSelectedGrids.length}
                                ></RoundInfo>
                            </Box>
                            <UserCard
                                markIcon={opMark}
                                level={opInfo.level}
                                status="op"
                                balance={opBalance}
                                bidAmount={opBid}
                                showAdvantageTip={!myIsNextDrawWinner}
                                planeUrl={aviationImg(opInfo.level)}
                            ></UserCard>
                        </Box>
                    </Box>
                    {onlyShow ? (
                        <StartJourney></StartJourney>
                    ) : (
                        <ButtonGroup
                            burner={burner}
                            bttGameAddress={bttGameAddress}
                            currentRound={currentRound}
                            startPlay={startPlay}
                            handleEndStep={handleEndStep}
                            handleNextStep={handleNextStep}
                            handlePreStep={handlePreStep}
                            handleStartPlay={handleStartPlay}
                            handleStartStep={handleStartStep}
                            handleStopPlay={handleStopPlay}
                        ></ButtonGroup>
                    )}
                </>
            )}
        </Box>
    );
};

export default BttPlayBackPage;
