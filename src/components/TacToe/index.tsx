import { MyUserCard, OpUserCard } from "@/components/TacToe/UserCard";
import { Box } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import CircleIcon from "@/components/TacToe/assets/circle.svg";
import XIcon from "@/components/TacToe/assets/x.svg";
import Board from "@/components/TacToe/Board";
import Timer from "@/components/TacToe/Timer";
import ToolBar from "./Toolbar";
import { useBlockNumber } from "@/contexts/BlockNumber";
import { useBidTacToeGameRetry } from "@/hooks/useRetryContract";
import {
    GameInfo,
    MyNewInfo,
    useGameContext,
    UserMarkType,
} from "@/pages/TacToe";
import { ethers } from "ethers";
import {
    useMultiProvider,
    useMultiSkylabBidTacToeGameContract,
    useMultiMercuryBaseContract,
} from "@/hooks/useMultiContract";
import useSkyToast from "@/hooks/useSkyToast";
import { handleError } from "@/utils/error";
import {
    useAddBttTransaction,
    useDeleteTokenIdCommited,
    useGridCommited,
} from "@/hooks/useTacToeStore";
import StatusTip from "./StatusTip";
import ResultUserCard from "./ResultUserCard";
import ResultButton from "./ResultButton";
import Chat from "./Chat";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import { useNavigate } from "react-router-dom";
import { useTacToeSigner } from "@/hooks/useSigner";
import { randomRpc } from "@/utils/web3Utils";
import { ZERO_DATA } from "@/skyConstants";
import { usePilotInfo } from "@/hooks/usePilotInfo";

export const getWinState = (gameState: GameState) => {
    return [
        GameState.WinByConnecting,
        GameState.WinByGridCount,
        GameState.WinBySurrender,
        GameState.WinByTimeout,
    ].includes(gameState);
};

// 定义所有可能的获胜组合
export const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // 横排
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // 竖排
    [0, 4, 8],
    [2, 4, 6], // 对角线
];

interface TacToeProps {
    onChangeGame: (position: "my" | "op", info: GameInfo) => void;
    onChangeNewInfo: (info: MyNewInfo) => void;
}

export enum GameState {
    Unknown = 0,
    WaitingForBid = 1,
    Commited = 2,
    Revealed = 3,
    WinByConnecting = 4,
    LoseByConnecting = 5,
    WinByTimeout = 6,
    LoseByTimeout = 7,
    WinBySurrender = 8,
    LoseBySurrender = 9,
    WinByGridCount = 10,
    LoseByGridCount = 11,
}

export enum MessageStatus {
    Unknown = 0,
    Sending = 1,
    Sent = 2,
}

const TacToePage = ({ onChangeGame, onChangeNewInfo }: TacToeProps) => {
    const toast = useSkyToast();
    const navigate = useNavigate();
    const {
        myInfo,
        opInfo,
        myGameInfo,
        opGameInfo,
        bidTacToeGameAddress,
        tokenId,
        list,
        onList,
    } = useGameContext();
    const { account, chainId } = useActiveWeb3React();
    const { blockNumber } = useBlockNumber();
    const [revealing, setRevealing] = useState<boolean>(false);
    const [currentGrid, setCurrentGrid] = useState<number>(-1);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [nextDrawWinner, setNextDrawWinner] = useState<string>("");
    const [messageLoading, setMessageLoading] = useState<MessageStatus>(
        MessageStatus.Unknown,
    );
    const [emoteLoading, setEmoteLoading] = useState<MessageStatus>(
        MessageStatus.Unknown,
    );

    const [messageIndex, setMessageIndex] = useState<number>(0);
    const [emoteIndex, setEmoteIndex] = useState<number>(0);

    const [burnerWallet] = useTacToeSigner(tokenId);

    const gameOver = useMemo(() => {
        return myGameInfo.gameState > GameState.Revealed;
    }, [myGameInfo.gameState]);
    const { getGridCommited, addGridCommited } = useGridCommited(
        tokenId,
        currentGrid,
    );

    const addBttTransaction = useAddBttTransaction(tokenId);
    const { tacToeGameRetryWrite } = useBidTacToeGameRetry(
        bidTacToeGameAddress,
        tokenId,
    );
    const deleteTokenIdCommited = useDeleteTokenIdCommited(tokenId);
    const multiSkylabBidTacToeGameContract =
        useMultiSkylabBidTacToeGameContract(bidTacToeGameAddress);
    const multiMercuryBaseContract = useMultiMercuryBaseContract();

    const ethcallProvider = useMultiProvider(chainId);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGetGameInfo = async () => {
        if (myGameInfo.gameState > GameState.Revealed) {
            return;
        }

        const [
            currentGrid,
            boardGrids,
            myBalance,
            myGameState,
            myRevealedBid,
            myTimeout,
            myMessage,
            myEmote,
            opBalance,
            opGameState,
            opRevealedBid,
            opTimeout,
            opMessage,
            opEmote,
            nextDrawWinner,
        ] = await ethcallProvider.all([
            multiSkylabBidTacToeGameContract.currentSelectedGrid(),
            multiSkylabBidTacToeGameContract.getGrid(),
            multiSkylabBidTacToeGameContract.balances(myInfo.burner),
            multiSkylabBidTacToeGameContract.gameStates(myInfo.burner),
            multiSkylabBidTacToeGameContract.getRevealedBids(myInfo.burner),
            multiSkylabBidTacToeGameContract.timeouts(myInfo.burner),
            multiSkylabBidTacToeGameContract.playerMessage(myInfo.burner),
            multiSkylabBidTacToeGameContract.playerEmote(myInfo.burner),
            multiSkylabBidTacToeGameContract.balances(opInfo.burner),
            multiSkylabBidTacToeGameContract.gameStates(opInfo.burner),
            multiSkylabBidTacToeGameContract.getRevealedBids(opInfo.burner),
            multiSkylabBidTacToeGameContract.timeouts(opInfo.burner),
            multiSkylabBidTacToeGameContract.playerMessage(opInfo.burner),
            multiSkylabBidTacToeGameContract.playerEmote(opInfo.burner),
            multiSkylabBidTacToeGameContract.nextDrawWinner(),
        ]);

        const _list = JSON.parse(JSON.stringify(list));
        const gameState = myGameState.toNumber();
        for (let i = 0; i < boardGrids.length; i++) {
            if (boardGrids[i] === ZERO_DATA) {
                _list[i].mark = UserMarkType.Empty;
            } else if (boardGrids[i] === myInfo.burner) {
                _list[i].mark = myInfo.mark;
            } else if (boardGrids[i] === opInfo.burner) {
                _list[i].mark = opInfo.mark;
            }
            _list[i].myValue = myRevealedBid[i].toNumber();
            _list[i].opValue = opRevealedBid[i].toNumber();
            _list[i].myMark = myInfo.mark;
            _list[i].opMark = opInfo.mark;
        }
        if (
            [
                GameState.WaitingForBid,
                GameState.Commited,
                GameState.Revealed,
            ].includes(gameState)
        ) {
            _list[currentGrid.toNumber()].mark = UserMarkType.Square;
        }

        // game over result
        if (gameState > GameState.Revealed) {
            const myIsWin = getWinState(gameState);
            const myIsCircle = myInfo.mark === UserMarkType.Circle;
            const burner = myIsWin ? myInfo.burner : opInfo.burner;
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
                        boardGrids[index0] === burner &&
                        boardGrids[index1] === burner &&
                        boardGrids[index2] === burner
                    ) {
                        _list[index0].mark = mark;
                        _list[index1].mark = mark;
                        _list[index2].mark = mark;
                        break;
                    }
                }
            } else {
                for (let i = 0; i < boardGrids.length; i++) {
                    if (boardGrids[i] === burner) {
                        _list[i].mark = mark;
                    }
                }
            }
        }
        setCurrentGrid(currentGrid.toNumber());
        onList(_list);
        onChangeGame("my", {
            balance: myBalance.toNumber(),
            gameState: myGameState.toNumber(),
            timeout: myTimeout.toNumber(),
            message: myMessage.toNumber(),
            emote: myEmote.toNumber(),
        });

        onChangeGame("op", {
            balance: opBalance.toNumber(),
            gameState: opGameState.toNumber(),
            timeout: opTimeout.toNumber(),
            message: opMessage.toNumber(),
            emote: opEmote.toNumber(),
        });
        setNextDrawWinner(nextDrawWinner);
    };

    const handleGetGas = async () => {
        const provider = new ethers.providers.JsonRpcProvider(
            randomRpc[chainId][0],
        );

        const singer = new ethers.Wallet(burnerWallet, provider);
        const balance = await provider.getBalance(singer.address);

        const minBalance = ethers.utils.parseEther("0.001");
        if (balance.lte(minBalance)) {
            return;
        }

        const transferResult = await singer.sendTransaction({
            to: account,
            value: balance.sub(minBalance),
        });
        await transferResult.wait();
        // deleteBurnerWallet();
    };

    const handleBid = async () => {
        try {
            if (loading) return;
            if (myGameInfo.gameState !== GameState.WaitingForBid) return;

            setLoading(true);
            const localSalt = getGridCommited();
            const salt = localSalt?.salt
                ? localSalt?.salt
                : Math.floor(Math.random() * 10000000) + 100000;
            if (!localSalt?.salt) {
                addGridCommited(bidAmount, salt);
            }

            const hash = ethers.utils.solidityKeccak256(
                ["uint256", "uint256"],
                [bidAmount, salt],
            );
            await tacToeGameRetryWrite("commitBid", [hash], 100000);
            onChangeGame("my", {
                ...myGameInfo,
                gameState: GameState.Commited,
            });
            setLoading(false);
            addGridCommited(bidAmount, salt);
        } catch (e) {
            console.log(e);
            setLoading(false);
            toast(handleError(e));
        }
    };

    const handleRevealedBid = async () => {
        try {
            const localSalt = getGridCommited();
            if (!localSalt) return;
            const { salt, amount } = localSalt;
            setRevealing(true);
            await tacToeGameRetryWrite(
                "revealBid",
                [amount, Number(salt)],
                300000,
            );
            setRevealing(false);
            setBidAmount(0);
        } catch (e) {
            setRevealing(false);
            console.log(e);
            toast(handleError(e));
        }
    };

    useEffect(() => {
        if (!multiSkylabBidTacToeGameContract || !blockNumber) return;
        handleGetGameInfo();
    }, [blockNumber, multiSkylabBidTacToeGameContract]);

    useEffect(() => {
        if (revealing) return;
        if (
            myGameInfo.gameState === GameState.Commited &&
            (opGameInfo.gameState === GameState.Commited ||
                opGameInfo.gameState === GameState.Revealed)
        ) {
            handleRevealedBid();
        }
    }, [myGameInfo.gameState, opGameInfo.gameState, getGridCommited]);

    // game over
    const handleGameOver = async () => {
        if (myGameInfo.gameState <= GameState.Revealed) return;

        handleGetGas();
        deleteTokenIdCommited();
        try {
            const [level, point] = await ethcallProvider.all([
                multiMercuryBaseContract.aviationLevels(tokenId),
                multiMercuryBaseContract.aviationPoints(tokenId),
            ]);
            onChangeNewInfo({
                point: point.toNumber(),
                level: level.toNumber(),
            });
            addBttTransaction({
                account: myInfo.address,
                burner: myInfo.burner,
                gameAddress: bidTacToeGameAddress,
                oldLevel: myInfo.level,
                newLevel: level.toNumber(),
                oldPoint: myInfo.point,
                newPoint: point.toNumber(),
                win: getWinState(myGameInfo.gameState),
            });
        } catch (e) {
            onChangeNewInfo({
                point: 0,
                level: 0,
            });
            addBttTransaction({
                account: myInfo.address,
                burner: myInfo.burner,
                gameAddress: bidTacToeGameAddress,
                oldLevel: myInfo.level,
                newLevel: 0,
                oldPoint: myInfo.point,
                newPoint: 0,
                win: getWinState(myGameInfo.gameState),
            });
        }
    };

    useEffect(() => {
        handleGameOver();
    }, [myGameInfo.gameState, deleteTokenIdCommited, addBttTransaction]);

    useEffect(() => {
        if (myInfo.address) {
            if (myInfo.address !== account) {
                navigate("/activities");
                return;
            }
        }
    }, [myInfo, account]);

    return (
        <Box
            sx={{
                padding: "1.4063vw 3.125vw",
                position: "relative",
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent:
                    myGameInfo.gameState <= GameState.Revealed
                        ? "space-between"
                        : "flex-start",
            }}
        >
            <Box>
                <Timer
                    myGameInfo={myGameInfo}
                    opGameInfo={opGameInfo}
                    autoBid={handleBid}
                ></Timer>
                <StatusTip
                    loading={loading}
                    myGameState={myGameInfo.gameState}
                    opGameState={opGameInfo.gameState}
                ></StatusTip>
            </Box>

            {myGameInfo.gameState <= GameState.Revealed && (
                <ToolBar quitType="game"></ToolBar>
            )}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Box
                    sx={{
                        width: "15.625vw",
                    }}
                >
                    {gameOver ? (
                        <ResultUserCard
                            showResult
                            win={getWinState(myGameInfo.gameState)}
                            userInfo={myInfo}
                        ></ResultUserCard>
                    ) : (
                        <MyUserCard
                            loading={loading}
                            messageLoading={messageLoading}
                            emoteLoading={emoteLoading}
                            showAdvantageTip={myInfo.burner === nextDrawWinner}
                            myGameState={myGameInfo.gameState}
                            message={myGameInfo.message}
                            emote={myGameInfo.emote}
                            level={myInfo.level}
                            messageIndex={messageIndex}
                            emoteIndex={emoteIndex}
                            markIcon={
                                myInfo.mark === UserMarkType.Circle
                                    ? CircleIcon
                                    : XIcon
                            }
                            address={myInfo.address}
                            balance={myGameInfo.balance}
                            bidAmount={bidAmount}
                            onConfirm={handleBid}
                            onInputChange={(value) => {
                                if (loading) return;
                                if (
                                    myGameInfo.gameState !==
                                    GameState.WaitingForBid
                                )
                                    return;

                                if (value < 0) return;
                                if (value > myGameInfo.balance) return;

                                setBidAmount(value);
                            }}
                            status="my"
                            planeUrl={myInfo.img}
                        ></MyUserCard>
                    )}
                </Box>

                <Box sx={{}}>
                    <Box
                        sx={{
                            paddingTop: "1.5625vw",
                        }}
                    >
                        <Board list={list}></Board>
                    </Box>
                    {myGameInfo.gameState > 3 && <ResultButton></ResultButton>}
                </Box>
                <Box
                    sx={{
                        width: "15.625vw",
                    }}
                >
                    {gameOver ? (
                        <ResultUserCard
                            win={getWinState(opGameInfo.gameState)}
                            userInfo={opInfo}
                        ></ResultUserCard>
                    ) : (
                        <OpUserCard
                            markIcon={
                                opInfo.mark === UserMarkType.Circle
                                    ? CircleIcon
                                    : XIcon
                            }
                            level={opInfo.level}
                            showAdvantageTip={opInfo.burner === nextDrawWinner}
                            myGameState={myGameInfo.gameState}
                            opGameState={opGameInfo.gameState}
                            message={opGameInfo.message}
                            emote={opGameInfo.emote}
                            address={opInfo.address}
                            balance={opGameInfo?.balance}
                            bidAmount={
                                list.length > 0 && currentGrid >= 0
                                    ? list[currentGrid].opValue
                                    : 0
                            }
                            status="op"
                            planeUrl={opInfo.img}
                        ></OpUserCard>
                    )}
                </Box>
            </Box>
            {!gameOver && (
                <Chat
                    onLoading={(type, loading, emoteIndex) => {
                        if (type === "setMessage") {
                            setMessageLoading(loading);
                            setMessageIndex(emoteIndex);
                        } else {
                            setEmoteLoading(loading);
                            setEmoteIndex(emoteIndex);
                        }
                    }}
                ></Chat>
            )}
        </Box>
    );
};

export default TacToePage;
