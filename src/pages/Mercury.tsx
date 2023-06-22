import { Box, HStack, Img } from "@chakra-ui/react";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useKnobVisibility } from "../contexts/KnobVisibilityContext";
import { Tournament } from "../components/Tournament";
import MercuryBg from "../components/Tournament/assets/mercury-bg.png";
import BPlanet from "../components/Tournament/assets/bPlanet.png";

import Logo from "../assets/logo.svg";
import Discord from "../assets/discord.svg";
import Tw from "../assets/tw.svg";
import Telegram from "../components/Tournament/assets/telegram.svg";
import ConnectWalletRound from "../components/Tournament/ConnectWalletRound";
import SubmitRound from "../components/Tournament/SubmitRound";
import ConfirmedRound from "../components/Tournament/ConfirmedRound";
import MissionRound from "../components/Tournament/MissionRound";
import useActiveWeb3React from "../hooks/useActiveWeb3React";
import BgImgD from "../components/Tournament/BgImgD";
import { useSkylabTestFlightContract } from "@/hooks/useContract";
import { useLocation } from "react-router-dom";
import qs from "query-string";
import Flight from "@/components/Tournament/Flight";
import useGameState from "@/hooks/useGameState";
import handleIpfsImg from "@/utils/ipfsImg";

export interface PlaneInfo {
    tokenId: number;
    level: number;
    img: string;
    round: number;
    state: number;
}

const Mercury = (): ReactElement => {
    const { search } = useLocation();
    const { setIsKnobVisible } = useKnobVisibility();
    const skylabTestFlightContract = useSkylabTestFlightContract();
    const { account } = useActiveWeb3React();
    const [step, setStep] = useState(0);
    const [planeList, setPlaneList] = useState<PlaneInfo[]>([]);
    const [currentImg, setCurrentImg] = useState(0);
    const [bigger, setBigger] = useState(false);
    const getGameState = useGameState();

    const handleNextStep = (nextStep?: number) => {
        setStep(nextStep);
    };

    const handleGetPlaneBalance = async () => {
        const balance = await skylabTestFlightContract.balanceOf(account);
        const p = new Array(balance.toNumber()).fill("").map((item, index) => {
            return skylabTestFlightContract.tokenOfOwnerByIndex(account, index);
        });
        const planeTokenIds = await Promise.all(p);
        const p1: any = [];
        planeTokenIds.forEach((tokenId) => {
            p1.push(skylabTestFlightContract._aviationLevels(tokenId));
            p1.push(skylabTestFlightContract._aviationHasWinCounter(tokenId));
            p1.push(skylabTestFlightContract.tokenURI(tokenId));
            p1.push(skylabTestFlightContract._aviationRounds(tokenId));
            p1.push(getGameState(tokenId));
        });
        const levels = await Promise.all(p1);
        setPlaneList(
            planeTokenIds.map((item, index) => {
                const level = levels[index * 5].toNumber();
                const hasWin = levels[index * 5 + 1] ? 0.5 : 0;
                const metadata = levels[index * 5 + 2];
                const round = levels[index * 5 + 3];
                const state = levels[index * 5 + 4];

                const base64String = metadata;
                const jsonString = window.atob(
                    base64String.substr(base64String.indexOf(",") + 1),
                );
                const jsonObject = JSON.parse(jsonString);
                return {
                    tokenId: item.toNumber(),
                    level: level + hasWin,
                    img: handleIpfsImg(jsonObject.image),
                    round: round.toNumber(),
                    state,
                };
            }),
        );
    };

    const handleCurrentImg = (index: number) => {
        setCurrentImg(index);
    };

    useEffect(() => {
        setIsKnobVisible(false);
        return () => setIsKnobVisible(true);
    }, []);

    useEffect(() => {
        if (!skylabTestFlightContract || !account) {
            return;
        }
        handleGetPlaneBalance();
    }, [skylabTestFlightContract, account]);

    useEffect(() => {
        const params = qs.parse(search) as any;
        if (!params.step) {
            return;
        }
        setStep(Number(params.step));
    }, []);

    return (
        <Box
            w="100vw"
            h="100vh"
            pos="relative"
            backgroundImage={`url(${BPlanet}),url(${MercuryBg})`}
            backgroundPosition="40% center,center center"
            backgroundSize={bigger ? "70%,cover" : "45%,cover"}
            backgroundRepeat={"no-repeat,no-repeat"}
            overflow="hidden"
            fontFamily="Orbitron"
            transition="all 0.2s ease-in-out"
        >
            <Box
                w="100vw"
                h="100vh"
                bg={step === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.4)"}
            >
                <Box zIndex={9}>
                    {step === 0 && <Tournament onNextRound={handleNextStep} />}
                    {step === 1 && (
                        <ConnectWalletRound onNextRound={handleNextStep} />
                    )}

                    {step === 2 && (
                        <MissionRound
                            currentImg={currentImg}
                            planeList={planeList}
                            bigger={bigger}
                            onBigger={(status: boolean) => {
                                setBigger(status);
                            }}
                            onNextRound={handleNextStep}
                            onCurrentImg={handleCurrentImg}
                        />
                    )}
                    {step === 7 && <Flight></Flight>}
                    {step === 3 && <SubmitRound onNextRound={handleNextStep} />}
                    {step === 4 && (
                        <ConfirmedRound onNextRound={handleNextStep} />
                    )}
                </Box>

                {[0, 4].includes(step) && <BgImgD show={true}></BgImgD>}
                <Box pos="absolute" bottom={0} left="5vw">
                    <HStack>
                        <Img width="35px" src={Logo}></Img>
                        <Img width="35px" src={Discord}></Img>
                        <Img width="35px" src={Tw}></Img>
                        <Img width="35px" src={Telegram}></Img>
                    </HStack>
                </Box>
            </Box>
        </Box>
    );
};

export default Mercury;
