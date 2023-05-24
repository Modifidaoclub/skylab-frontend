import { Box, Text, Image, Img } from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

import GameBackground from "../../../assets/game-win-background.png";
import Aviation from "../../../assets/aviation-4.svg";
import { useGameContext } from "../../../pages/Game";
import { GridPosition, ResultMap } from "../map";
import { generateWinText } from "../utils";
import { Info } from "./info";
import MetadataPlaneImg from "@/skyConstants/metadata";
import { shortenAddress } from "@/utils";
import { useSkylabGameFlightRaceContract } from "@/hooks/useContract";

type Props = {};

const Footer: FC<{ onNext: () => void }> = ({ onNext }) => {
    const text = generateWinText({
        myLevel: 4,
        myBattery: 15,
        myFuel: 100000,
        opponentLevel: 3,
        opponentBattery: 10,
        opponentFuel: 12,
    });

    const onShare = async () => {
        const canvas = await html2canvas(document.body);
        canvas.toBlob((blob) => {
            if (!blob) {
                return;
            }
            saveAs(blob, "my_image.jpg");
        });
    };

    return (
        <Box userSelect="none">
            <Text
                textAlign="center"
                pos="absolute"
                width="12vw"
                minWidth="100px"
                fontSize="40px"
                left="1vw"
                top="14.5vh"
                color="rgb(190, 190, 192)"
                cursor="pointer"
                fontFamily="Orbitron"
                fontWeight="600"
                onClick={() => {
                    onNext();
                }}
            >
                Home
            </Text>
            <Text
                textAlign="center"
                pos="absolute"
                width="13.5vw"
                minWidth="100px"
                fontSize="40px"
                right="0.5vw"
                top="14.5vh"
                color="rgb(22, 25, 87)"
                cursor="pointer"
                fontFamily="Orbitron"
                fontWeight="600"
                onClick={onShare}
            >
                <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        text,
                    )}`}
                >
                    Share
                </a>
            </Text>
        </Box>
    );
};

export const GameWin: FC<Props> = ({}) => {
    const { onNext, map, myInfo, opInfo, tokenId } = useGameContext();

    const [myPath, setMyPath] = useState<GridPosition[]>([]);
    const [myTime, setMyTime] = useState(0);
    const [opTime, setOpTime] = useState(0);
    const [opPath, setOpPath] = useState<GridPosition[]>([]);
    const [opUsedResources, setOpUsedResources] = useState({
        fuel: 0,
        battery: 0,
    });
    const [myUsedResources, setMyUsedResources] = useState({
        fuel: 0,
        battery: 0,
    });
    const [loading, setLoading] = useState(false);
    const skylabGameFlightRaceContract = useSkylabGameFlightRaceContract();
    // 获取游戏状态
    const getGameState = async (tokenId: number) => {
        const state = await skylabGameFlightRaceContract.gameState(tokenId);
        return state.toNumber();
    };
    const handleCleanUp = async () => {
        const state = await getGameState(tokenId);
        if (state === 5 || state === 6 || state === 7) {
            try {
                setLoading(true);
                const res = await skylabGameFlightRaceContract.postGameCleanUp(
                    tokenId,
                );
                await res.wait();
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    };

    const handleGetOpponentPath = async () => {
        const time = await skylabGameFlightRaceContract.getOpponentFinalTime(
            tokenId,
        );
        const path = await skylabGameFlightRaceContract.getOpponentPath(
            tokenId,
        );

        const usedResources =
            await skylabGameFlightRaceContract.getOpponentUsedResources(
                tokenId,
            );
        setOpTime(time.toNumber());

        const opPath = [];
        const opUsedResources = {
            fuel: 0,
            battery: 0,
        };
        for (let i = 1; i < path.length; i += 2) {
            opPath.push({
                x: path[i].toNumber(),
                y: path[i + 1].toNumber(),
            });
            opUsedResources.fuel += usedResources[i].toNumber();
            opUsedResources.battery += usedResources[i + 1].toNumber();
        }
        setOpPath(opPath);
        setOpUsedResources(opUsedResources);
        console.log(opUsedResources, "opPath");
    };

    useEffect(() => {
        const keyboardListener = (event: KeyboardEvent) => {
            const key = event.key;

            if (key === "Enter" && event.shiftKey) {
                onNext();
            }
        };
        document.addEventListener("keydown", keyboardListener);

        return () => document.removeEventListener("keydown", keyboardListener);
    }, []);

    useEffect(() => {
        // handleCleanUp();
    }, []);

    // 获取我的信息
    useEffect(() => {
        const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo"));
        const usedResourcesList = tokenInfo[tokenId].used_resources;
        const myUsedResources = {
            fuel: 0,
            battery: 0,
        };
        usedResourcesList.forEach((item: number) => {
            myUsedResources.fuel += item[0];
            myUsedResources.battery += item[1];
        });
        setMyUsedResources(myUsedResources);
        const myTime = tokenInfo[tokenId].time;
        setMyTime(myTime);
        const mapPath = tokenInfo[tokenId].path;
        const path = [];
        for (let i = 0; i < mapPath.length; i++) {
            if (mapPath[i][0] === 7 && mapPath[i][1] === 7) {
                path.push({ x: 7, y: 7 });
                break;
            } else {
                path.push({ x: mapPath[i][0], y: mapPath[i][1] });
            }
        }

        setMyPath(path);
    }, []);

    // 获取对手的信息
    useEffect(() => {
        if (!tokenId || !skylabGameFlightRaceContract) {
            return;
        }
        handleGetOpponentPath();
    }, [tokenId, skylabGameFlightRaceContract]);

    return (
        <Box
            pos="relative"
            bgImage={GameBackground}
            bgRepeat="no-repeat"
            height="100vh"
            bgSize="100% 100%"
            overflow="hidden"
        >
            <Image
                w="45vw"
                pos="absolute"
                left="2vw"
                bottom="8vh"
                src={Aviation}
            />

            <Box pos="absolute" left="43vw" top="36vh">
                <Info
                    win={true}
                    mine={{
                        id: shortenAddress(myInfo?.address, 4, 4),
                        time: myTime,
                        avatar: MetadataPlaneImg(myInfo?.tokenId),
                        usedResources: myUsedResources,
                    }}
                    opponent={{
                        id: shortenAddress(opInfo?.address, 4, 4),
                        time: opTime,
                        avatar: MetadataPlaneImg(opInfo?.tokenId),
                        usedResources: opUsedResources,
                    }}
                />
            </Box>

            <Footer onNext={onNext} />

            <Box pos="absolute" left="52vw" bottom="8vh" userSelect="none">
                <ResultMap map={map} myPath={myPath} opPath={opPath} />
            </Box>
        </Box>
    );
};

export default GameWin;
