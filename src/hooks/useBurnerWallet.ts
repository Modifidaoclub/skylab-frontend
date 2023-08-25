import { ethers } from "ethers";
import { useCallback } from "react";
import useActiveWeb3React from "./useActiveWeb3React";
import {
    getSigner,
    useLocalSigner,
    useSkylabBidTacToeContract,
    useSkylabGameFlightRaceContract,
} from "./useContract";
import { ChainId } from "@/utils/web3Utils";
import useSkyToast from "./useSkyToast";
import {
    ContractType,
    useRetryBalanceCall,
    useRetryContractCall,
} from "./useRetryContract";

export enum BalanceState {
    ACCOUNT_LACK,
    LACK,
    ENOUTH,
}

export enum ApproveGameState {
    APPROVED,
    NOT_APPROVED,
}

const balanceInfo = {
    [ChainId.POLYGON]: {
        low: "1.5",
        high: "3",
        need: "3.01",
    },
    [ChainId.MUMBAI]: {
        low: "0.025",
        high: "0.05",
        need: "0.051",
    },
};

const useBurnerWallet = (tokenId: number): any => {
    const toast = useSkyToast();
    const { chainId } = useActiveWeb3React();
    const { library, account } = useActiveWeb3React();
    const skylabGameFlightRaceContract = useSkylabGameFlightRaceContract();
    const skylabBidTacToeContract = useSkylabBidTacToeContract();

    const burner = useLocalSigner();
    const retryContractCall = useRetryContractCall();
    const balanceCall = useRetryBalanceCall();

    const getBalanceState = useCallback(async () => {
        if (!library || !burner) {
            return;
        }

        const burnerBalance = await balanceCall(burner.address);
        if (
            burnerBalance.lt(ethers.utils.parseEther(balanceInfo[chainId].low))
        ) {
            const balance = await balanceCall(account);
            if (
                balance.lt(ethers.utils.parseEther(balanceInfo[chainId].need))
            ) {
                return BalanceState.ACCOUNT_LACK;
            }
            return BalanceState.LACK;
        }
        return BalanceState.ENOUTH;
    }, [burner, library]);

    const transferGas = useCallback(async () => {
        if (!library || !account || !burner) {
            return;
        }
        toast("Confirm transaction in MetaMask to proceed");
        const singer = getSigner(library, account);
        const transferResult = await singer.sendTransaction({
            to: burner.address,
            value: ethers.utils.parseEther(balanceInfo[chainId].high),
        });
        await transferResult.wait();
    }, [library, burner, account]);

    const getApproveGameState = useCallback(async () => {
        if (!skylabGameFlightRaceContract || !tokenId || !burner) {
            return;
        }

        const isApprovedForGame = await retryContractCall(
            ContractType.RACETOURNAMENT,
            "isApprovedForGame",
            [tokenId],
            true,
        );

        return isApprovedForGame
            ? ApproveGameState.APPROVED
            : ApproveGameState.NOT_APPROVED;
    }, [skylabGameFlightRaceContract, tokenId, burner]);

    const getApproveBitTacToeGameState = useCallback(async () => {
        if (!skylabBidTacToeContract || !tokenId || !burner) {
            return;
        }

        const isApprovedForGame = await retryContractCall(
            ContractType.BIDTACTOEFACTORY,
            "isApprovedForGame",
            [tokenId],
            true,
        );

        return isApprovedForGame
            ? ApproveGameState.APPROVED
            : ApproveGameState.NOT_APPROVED;
    }, [skylabBidTacToeContract, tokenId, burner]);

    const approveForGame = useCallback(async () => {
        if (!account || !skylabGameFlightRaceContract || !tokenId || !burner) {
            return;
        }
        console.log("start approveForGame");
        const approveResult = await skylabGameFlightRaceContract.approveForGame(
            burner.address,
            tokenId,
        );
        await approveResult.wait();
        console.log("success approveForGame");
    }, [tokenId, burner, account, skylabGameFlightRaceContract]);

    const approveForBidTacToeGame = useCallback(async () => {
        if (!account || !skylabBidTacToeContract || !tokenId || !burner) {
            return;
        }
        console.log("start approveForGame");
        const approveResult = await skylabBidTacToeContract.approveForGame(
            burner.address,
            tokenId,
        );
        await approveResult.wait();
        console.log("success approveForGame");
    }, [tokenId, burner, account, skylabBidTacToeContract]);

    const handleCheckBurner = async (
        transferBeforFn?: Function,
        approveBeforeFn?: Function,
    ) => {
        const balanceState = await getBalanceState();
        if (balanceState === BalanceState.ACCOUNT_LACK) {
            toast(
                `You do not have enough balance, have at least ${balanceInfo[chainId].high} MATIC in your wallet and refresh`,
                true,
            );

            return;
        } else if (balanceState === BalanceState.LACK) {
            transferBeforFn?.();
            await transferGas();
        }

        const approveState = await getApproveGameState();
        if (approveState === ApproveGameState.NOT_APPROVED) {
            approveBeforeFn?.();
            await approveForGame();
        }
        return true;
    };

    const handleCheckBurnerBidTacToe = async (
        transferBeforFn?: Function,
        approveBeforeFn?: Function,
    ) => {
        const balanceState = await getBalanceState();
        if (balanceState === BalanceState.ACCOUNT_LACK) {
            toast(
                `You do not have enough balance, have at least ${balanceInfo[chainId].high} MATIC in your wallet and refresh`,
                true,
            );

            return;
        } else if (balanceState === BalanceState.LACK) {
            transferBeforFn?.();
            await transferGas();
        }

        const approveState = await getApproveBitTacToeGameState();
        if (approveState === ApproveGameState.NOT_APPROVED) {
            approveBeforeFn?.();
            await approveForBidTacToeGame();
        }
        return true;
    };

    return {
        approveForGame,
        getApproveGameState,
        getBalanceState,
        transferGas,
        burner,
        handleCheckBurner,
        handleCheckBurnerBidTacToe,
    };
};

export default useBurnerWallet;
