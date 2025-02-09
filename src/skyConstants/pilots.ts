import { ChainId } from "@/utils/web3Utils";
import NounsImg from "@/assets/pilots/nouns.avif";
import MoonbirdsImg from "@/assets/pilots/moonbirds.avif";
import MferImg from "@/assets/pilots/mfer.avif";
import CryptoadzImg from "@/assets/pilots/cryptoadz.webp";
import BabymercImg from "@/assets/pilots/babymerc.jpg";
import MercsImg from "@/assets/pilots/mercs.jpg";
import { getPilotImgFromUrl } from "@/utils/ipfsImg";
import { ZERO_DATA } from ".";
import { Contract, Provider } from "ethers-multicall";

const MainnetPilotList: PilotBaseInfo[] = [
    {
        address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
        img: NounsImg,
        name: "Nouns",
        enumerable: false,
        chainId: ChainId.ETHEREUM,
        openSeaUrl: "https://opensea.io/collection/nouns",
    },
    {
        address: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
        img: MoonbirdsImg,
        name: "Moonbirds",
        enumerable: false,
        chainId: ChainId.ETHEREUM,
        openSeaUrl: "https://opensea.io/collection/proof-moonbirds",
    },
    {
        address: "0x79FCDEF22feeD20eDDacbB2587640e45491b757f",
        img: MferImg,
        name: "Mfer",
        enumerable: false,
        chainId: ChainId.ETHEREUM,
        openSeaUrl: "https://opensea.io/collection/mfers",
    },
    {
        address: "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6",
        img: CryptoadzImg,
        name: "Cryptoadz",
        enumerable: false,
        chainId: ChainId.ETHEREUM,
        openSeaUrl: "https://opensea.io/collection/cryptoadz-by-gremplin",
    },
];

export interface PilotBaseInfo {
    address: string;
    img?: string;
    name?: string;
    enumerable?: boolean;
    chainId?: ChainId;
    openSeaUrl?: string;
    disabled?: boolean;
}

const AllPilotList: {
    [chainId in ChainId]?: PilotBaseInfo[];
} = {
    [ChainId.MUMBAI]: [
        ...MainnetPilotList,
        {
            address: "0x2f5683e27F80C7F9EE98FA083Aa7Bc875c650742",
            img: BabymercImg,
            name: "Baby Merc",
            enumerable: true,
            chainId: ChainId.MUMBAI,
        },
        {
            address: "0xfa068dB54c31B230530B0D287Dd5cE0C869D6640",
            img: MercsImg,
            name: "Merc2",
            enumerable: true,
            chainId: ChainId.MUMBAI,
            disabled: true,
        },
    ],
    [ChainId.POLYGON]: [
        ...MainnetPilotList,
        {
            address: "0x41723AC847978665E4161a0c2fC6b437a72AdFdD",
        },
    ],
};

export const getPilotInfo = (chainId: ChainId, address: string) => {
    const pilotList = AllPilotList[chainId];
    const pilot = pilotList.find(
        (pilot: PilotBaseInfo) => pilot.address === address,
    );
    return pilot;
};

const getMoonbirdsImg = (pilotId: number | string) => {
    return `https://moonbirds.imgix.net/${pilotId}`;
};

const getNounsImg = (pilotId: number | string) => {
    return `https://noun.pics/${pilotId}`;
};

// 是否是特殊的飞行员 Moonbirds 和 Nouns
export const getIsSpecialPilot = (address: string) => {
    return (
        address === "0x23581767a106ae21c074b2276D25e5C3e136a68b" ||
        address === "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03"
    );
};

export const getSpecialPilotImg = (
    address: string,
    pilotId: number | string,
) => {
    if (address === "0x23581767a106ae21c074b2276D25e5C3e136a68b") {
        return getMoonbirdsImg(pilotId);
    } else {
        return getNounsImg(pilotId);
    }
};

export interface ActivePilotRes {
    collectionAddress: string;
    pilotId: number;
    isSpecialPilot?: boolean;
}

export const handlePilotsInfo = async ({
    allPilot,
    chainId,
    ethereumMultiDelegateERC721Contract,
    defaultMultiDelegateERC721Contract,
    ethereumMultiProvider,
    defaultMultiProvider,
    values,
    pilotOwners,
}: {
    allPilot: ActivePilotRes[];
    chainId: number;
    ethereumMultiDelegateERC721Contract: Contract;
    defaultMultiDelegateERC721Contract: Contract;
    ethereumMultiProvider: Provider;
    defaultMultiProvider: Provider;
    values: number[];
    pilotOwners?: string[];
}) => {
    const pPilotInfoDefault: any = [];
    const pPilotInfoEthereum: any = [];
    const chainIdIndex: any = [];

    allPilot.forEach((item) => {
        const collectionAddress = item.collectionAddress;
        const pilotId = item.pilotId;
        const pilotChainId = getPilotInfo(chainId, collectionAddress).chainId;

        if (pilotChainId === ChainId.ETHEREUM) {
            if (!item.isSpecialPilot) {
                pPilotInfoEthereum.push(
                    ethereumMultiDelegateERC721Contract.tokenURI(
                        collectionAddress,
                        pilotId,
                    ),
                );
            }
            pPilotInfoEthereum.push(
                ethereumMultiDelegateERC721Contract.ownerOf(
                    collectionAddress,
                    pilotId,
                ),
            );
        } else {
            pPilotInfoDefault.push(
                defaultMultiDelegateERC721Contract.tokenURI(
                    collectionAddress,
                    pilotId,
                ),
                defaultMultiDelegateERC721Contract.ownerOf(
                    collectionAddress,
                    pilotId,
                ),
            );
        }
        chainIdIndex.push(pilotChainId);
    });

    const [ethereumPilotRes, defaultRes] = await Promise.all([
        ethereumMultiProvider.all(pPilotInfoEthereum),
        defaultMultiProvider.all(pPilotInfoDefault),
    ]);

    let defaultIndex = 0;
    let ethereumIndex = 0;
    const list = allPilot.map((item, index) => {
        let imgUrl = "";
        let owner = "";
        if (chainIdIndex[index] === ChainId.ETHEREUM) {
            if (item.isSpecialPilot) {
                imgUrl = getSpecialPilotImg(
                    item.collectionAddress,
                    item.pilotId,
                );
            } else {
                imgUrl = ethereumPilotRes[ethereumIndex++];
            }
            owner = ethereumPilotRes[ethereumIndex++];
        } else {
            imgUrl = defaultRes[defaultIndex++];
            owner = defaultRes[defaultIndex++];
        }
        const imgPromise = item.isSpecialPilot
            ? imgUrl
            : getPilotImgFromUrl(imgUrl);
        return {
            address: item.collectionAddress,
            pilotId: item.pilotId,
            pilotImg: imgPromise,
            value: values[index],
            pilotOwner: pilotOwners?.[index] ? pilotOwners[index] : owner,
            actualPilotOwner: owner,
        };
    });

    const imgRes = await Promise.all(
        list.map((item) => {
            return item.pilotImg;
        }),
    );

    const _list = list
        .map((item, index) => {
            return { ...item, pilotImg: imgRes[index] };
        })
        .filter(
            (item) =>
                item.pilotOwner !== ZERO_DATA &&
                item.actualPilotOwner !== ZERO_DATA,
        )
        .sort((a, b) => b.value - a.value);
    return _list;
};

export default AllPilotList;
