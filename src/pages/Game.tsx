import React, {
    ReactElement,
    useEffect,
    useState,
    createContext,
    useContext,
} from "react";
import qs from "query-string";
import { GameLoading } from "../components/GameLoading";
import { GameContent, MapInfo } from "../components/GameContent";
import { Presetting } from "../components/GameContent/presetting";
import { Driving } from "../components/GameContent/driving";
import { useKnobVisibility } from "../contexts/KnobVisibilityContext";
import { GridPosition } from "../components/GameContent/map";
import { useLocation, useNavigate } from "react-router-dom";
import { MapStart } from "@/components/GameContent/mapstart";
import { useDisclosure, useToast } from "@chakra-ui/react";
import FleeModal from "../components/GameContent/FleeModal";
import GameLose from "@/components/GameContent/result/lose";
import GameWin from "@/components/GameContent/result/win";
import ResultPending from "@/components/GameContent/resultPending";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import { ContractType, useRetryContractCall } from "@/hooks/useRetryContract";
import {
    useMultiProvider,
    useMultiMercuryBaseContract,
    useMultiSkylabGameFlightRaceContract,
} from "@/hooks/useMultiContract";
import handleIpfsUrl from "@/utils/ipfsImg";
import { updateTokenInfoValue } from "@/utils/tokenInfo";

const GameContext = createContext<{
    myState: number;
    opState: number;
    opTokenId: number;
    map_params: number[][][];
    myInfo: Info;
    opInfo: Info;
    map: MapInfo[][];
    level: number | undefined;
    onNext: (nextStep?: number) => void;
    mapPath: GridPosition[];
    tokenId: number;
    onMapChange: (map: MapInfo[][]) => void;
    onMapPathChange: (mapPath: GridPosition[]) => void;
    onOpen: () => void;
    onMapParams: (map: [][][]) => void;
}>(null);

export const useGameContext = () => useContext(GameContext);
export interface Info {
    address: string;
    fuel: number;
    battery: number;
    level: number;
    img: string;
}

const Game = (): ReactElement => {
    const { chainId } = useActiveWeb3React();
    const ethcallProvider = useMultiProvider(chainId);
    const multiMercuryBaseContract = useMultiMercuryBaseContract();
    const multiSkylabGameFlightRaceContract =
        useMultiSkylabGameFlightRaceContract();
    const { account, library } = useActiveWeb3React();
    const retryContractCall = useRetryContractCall();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [tokenId, setTokenId] = useState<number>(0);
    const [step, setStep] = useState(0);
    const [myState, setMyState] = useState(-1);
    const [opState, setOpState] = useState(-1);
    const [opTokenId, setOpTokenId] = useState<number>(0);
    const [map, setMap] = useState([]);
    const [myInfo, setMyInfo] = useState<Info>({
        address: "",
        fuel: 0,
        battery: 0,
        level: 0,
        img: "",
    });

    const [opInfo, setOpInfo] = useState<Info>({
        address: "",
        fuel: 0,
        battery: 0,
        level: 0,
        img: "",
    });
    const [gameLevel, setGameLevel] = useState(0); //游戏等级

    const [mapPath, setMapPath] = useState<GridPosition[]>([]);
    const [map_params, setMap_params] = useState<number[][][]>([]);
    const { setIsKnobVisible } = useKnobVisibility();

    const onNext = async (nextStep?: number) => {
        onClose();
        if (nextStep) {
            setStep(nextStep);
        } else {
            setStep((val) => val + 1);
        }
    };

    // 设置路径
    const handleMapPathChange = (mapPath: GridPosition[]) => {
        setMapPath(mapPath);
    };

    // 获取等级
    const handleGetGameLevel = async () => {
        const gameLevel = await retryContractCall(
            ContractType.TOURNAMENT,
            "aviationLevels",
            [tokenId],
        );
        setGameLevel(gameLevel.toNumber());
    };

    // 设置地图
    const handleMapChange = (map: MapInfo[][]) => {
        setMap(map);
    };

    // 获取我的信息
    const getMyInfo = async () => {
        try {
            const [myTank, myAccount, myLevel, myHasWin, myMetadata] =
                await ethcallProvider.all([
                    multiSkylabGameFlightRaceContract.gameTank(tokenId),
                    multiMercuryBaseContract.ownerOf(tokenId),
                    multiMercuryBaseContract.aviationLevels(tokenId),
                    multiMercuryBaseContract._aviationHasWinCounter(tokenId),
                    multiMercuryBaseContract.tokenURI(tokenId),
                ]);

            const base64String = myMetadata;
            const jsonString = window.atob(
                base64String.substr(base64String.indexOf(",") + 1),
            );
            const jsonObject = JSON.parse(jsonString);
            setMyInfo({
                address: myAccount,
                fuel: myTank.fuel.toNumber(),
                battery: myTank.battery.toNumber(),
                level: myLevel.toNumber() + (myHasWin ? 0.5 : 0),
                img: handleIpfsUrl(jsonObject.image),
            });
        } catch (error) {
            console.log(error);
        }
    };

    // 获取对手信息
    const getOpponentInfo = async () => {
        try {
            const [opTank, opLevel, opHasWin] = await ethcallProvider.all([
                multiSkylabGameFlightRaceContract.gameTank(opTokenId),
                multiMercuryBaseContract.aviationLevels(opTokenId),
                multiMercuryBaseContract._aviationHasWinCounter(opTokenId),
            ]);

            let img = "";
            let opAccount = "";
            if (opLevel.toNumber() !== 0) {
                opAccount = await retryContractCall(
                    ContractType.TOURNAMENT,
                    "ownerOf",
                    [opTokenId],
                );
                const myMetadata = await retryContractCall(
                    ContractType.TOURNAMENT,
                    "tokenURI",
                    [opTokenId],
                );

                const base64String = myMetadata;
                const jsonString = window.atob(
                    base64String.substr(base64String.indexOf(",") + 1),
                );
                const jsonObject = JSON.parse(jsonString);
                img = handleIpfsUrl(jsonObject.image);
            }

            setOpInfo({
                address: opAccount,
                fuel: opTank.fuel.toNumber(),
                battery: opTank.battery.toNumber(),
                level: opLevel.toNumber() + (opHasWin ? 0.5 : 0),
                img: img,
            });
            updateTokenInfoValue(opTokenId, {
                opAccount: opAccount,
            });
        } catch (error) {
            setOpInfo({
                address: "",
                fuel: 0,
                battery: 0,
                level: 0,
                img: "",
            });
        }
    };

    useEffect(() => {
        setIsKnobVisible(false);
        return () => setIsKnobVisible(true);
    }, []);

    useEffect(() => {
        const params = qs.parse(search) as any;
        if (tokenId === 0) {
            setTokenId(params.tokenId);
        } else if (!params.tokenId) {
            navigate(`/activities`);
        } else if (tokenId != params.tokenId) {
            navigate(`/activities`);
        }
    }, [search, tokenId]);

    useEffect(() => {
        if (!retryContractCall || !tokenId) {
            return;
        }

        handleGetGameLevel();
    }, [retryContractCall, tokenId]);

    useEffect(() => {
        if (!myInfo.address) {
            return;
        }
        if (myInfo.address.toLowerCase() !== account.toLowerCase()) {
            // 如果不是自己的token
            navigate(`/activities`);
            return;
        }
    }, [account, myInfo]);

    useEffect(() => {
        const timer = setInterval(async () => {
            if (!tokenId || !retryContractCall) {
                return;
            }
            const state = await retryContractCall(
                ContractType.RACETOURNAMENT,
                "gameState",
                [tokenId],
            );
            console.log("current myState is", state.toNumber());
            setMyState(state.toNumber());
            if (opTokenId) {
                const opState = await retryContractCall(
                    ContractType.RACETOURNAMENT,
                    "gameState",
                    [opTokenId],
                );
                setOpState(opState.toNumber());
                console.log("current opState is", opState.toNumber());
            }
        }, 3000);

        return () => {
            clearInterval(timer);
        };
    }, [tokenId, opTokenId, retryContractCall]);

    useEffect(() => {
        if (!account) {
            navigate(`/activities`);
            return;
        }
        if (
            !multiMercuryBaseContract ||
            !multiSkylabGameFlightRaceContract ||
            !tokenId ||
            !ethcallProvider
        ) {
            return;
        }
        getMyInfo();
    }, [
        multiMercuryBaseContract,
        multiSkylabGameFlightRaceContract,
        account,
        tokenId,
        ethcallProvider,
    ]);

    useEffect(() => {
        if (
            !retryContractCall ||
            !opTokenId ||
            !multiMercuryBaseContract ||
            !multiSkylabGameFlightRaceContract ||
            !library
        ) {
            return;
        }
        if (opTokenId !== 0) {
            getOpponentInfo();
        }
    }, [
        retryContractCall,
        opTokenId,
        library,
        multiMercuryBaseContract,
        multiSkylabGameFlightRaceContract,
    ]);

    useEffect(() => {
        const timer = setInterval(async () => {
            if (opTokenId === 0) {
                const res = await retryContractCall(
                    ContractType.RACETOURNAMENT,
                    "matchedAviationIDs",
                    [tokenId],
                );
                if (res.toNumber() === 0) {
                    return;
                }
                setOpTokenId(res.toNumber());
                timer && clearInterval(timer);
            }
        }, 3000);
        return () => {
            timer && clearInterval(timer);
        };
    }, [tokenId, opTokenId, retryContractCall]);

    return (
        <GameContext.Provider
            value={{
                myState,
                opState,
                opTokenId,
                map_params: map_params,
                onOpen,
                opInfo,
                myInfo,
                map,
                onNext,
                mapPath: mapPath,
                level: gameLevel,
                tokenId,
                onMapChange: handleMapChange,
                onMapPathChange: handleMapPathChange,
                onMapParams: setMap_params,
            }}
        >
            <>
                {step === 0 && <GameLoading />}
                {step === 1 && <GameContent />}
                {step === 2 && <MapStart />}
                {step === 3 && <Presetting />}
                {step === 4 && <Driving />}
                {step === 6 && <ResultPending />}
                {step === 7 && <GameLose />}
                {step === 8 && <GameWin />}
                <FleeModal onClose={onClose} isOpen={isOpen}></FleeModal>
            </>
        </GameContext.Provider>
    );
};

export default Game;
