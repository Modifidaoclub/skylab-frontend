import {
    BaseProvider,
    ExternalProvider,
    getDefaultProvider,
    JsonRpcFetchFunc,
    Web3Provider,
} from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { BigNumber } from "@ethersproject/bignumber";

/** SUPPORTED CHAINS */
export enum ChainId {
    ETHEREUM = 1,
    POLYGON = 137,
    MUMBAI = 80001,
}

export type ChainInfo = {
    rpcUrls: string[];
    chainName: string;
    nativeCurrency?: { name: string; decimals: number; symbol: string };
    blockExplorerUrls?: string[];
    iconUrls?: string[];
};

export const RPC_URLS = {
    [ChainId.ETHEREUM]: ["https://eth.llamarpc.com"],
    [ChainId.POLYGON]: [
        "https://polygon.llamarpc.com",
        "https://rpc-mainnet.matic.quiknode.pro",
    ],
    [ChainId.MUMBAI]: [
        "https://polygon-mumbai.blockpi.network/v1/rpc/public",
        "https://polygon-mumbai-bor.publicnode.com",
        "https://rpc.ankr.com/polygon_mumbai",
        "https://rpc-mumbai.maticvigil.com",
    ],
};

const getRandomRpc = () => {
    const _RPC_URLS = JSON.parse(JSON.stringify(RPC_URLS));
    for (const chainId in _RPC_URLS) {
        _RPC_URLS[chainId] = _RPC_URLS[chainId].sort(() => Math.random() - 0.5);
    }
    return _RPC_URLS;
};
export const randomRpc = getRandomRpc();

export const CHAIN_NAMES = {
    [ChainId.POLYGON]: "Polygon",
    [ChainId.MUMBAI]: "Mumbai",
};

export const SUPPORTED_NETWORKS: { [chainId in ChainId]?: ChainInfo } = {
    [ChainId.POLYGON]: {
        rpcUrls: RPC_URLS[ChainId.POLYGON],
        chainName: "Polygon",
        nativeCurrency: {
            name: "MATIC",
            decimals: 18,
            symbol: "MATIC",
        },
        blockExplorerUrls: ["https://polygonscan.com/"],
    },
    [ChainId.MUMBAI]: {
        rpcUrls: RPC_URLS[ChainId.MUMBAI],
        chainName: "Mumbai",
        nativeCurrency: {
            name: "MATIC",
            decimals: 18,
            symbol: "MATIC",
        },
        blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    },
};

let networkLibrary: BaseProvider | undefined;

export const NETWORK_CONTEXT_NAME = "SkyLabNetworkContext";

export const DEAFAULT_CHAINID =
    Number(process.env.REACT_APP_CHAIN_ID) || ChainId.POLYGON;

export const NETWORK_URL = randomRpc[DEAFAULT_CHAINID][0];

/**
 * Get the web3 provider instance and set its polling interval
 * Note: web3-react relies on the existence of a Web3ReactProvider
 * at the root of your application (or more accurately, at the root
 * of the subtree which you'd like to have web3 functionality).
 * It requires a single getLibrary prop which is responsible for
 * instantiating a web3 convenience library object from a low-level provider.
 *
 * This function will be passed to the *getLibrary* prop.
 * @param provider the current web3 provider (i.e. injected/metamask)
 * @returns Web3Provider instance
 */
export const getLibrary = (
    provider: ExternalProvider | JsonRpcFetchFunc,
): Web3Provider => {
    const library = new Web3Provider(provider, "any");
    library.pollingInterval = 5000;
    return library;
};

export const getNetworkLibrary = (): BaseProvider => {
    const provider = getDefaultProvider(NETWORK_URL);
    return (networkLibrary = networkLibrary ?? provider);
};

/** Network connector (default connection to network - i.e. Polygon) */
export const network = new NetworkConnector({
    urls: { [DEAFAULT_CHAINID]: NETWORK_URL },
});

/** Injected Connector (metamask) */
export const injected = new InjectedConnector({
    supportedChainIds: [ChainId.POLYGON, ChainId.MUMBAI],
});

/** WalletConnect Connector (network agnostic) */
export const walletconnect = new WalletConnectConnector({
    rpc: { [ChainId.POLYGON]: NETWORK_URL },
    chainId: ChainId.POLYGON,
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
});

/** WalletLink Connector (CoinBase) */
export const walletlink = new WalletLinkConnector({
    url: NETWORK_URL,
    appName: "SkyLab",
    supportedChainIds: [ChainId.POLYGON],
});

// add 10%
export function calculateGasMargin(value: BigNumber, margin = 1000): BigNumber {
    return value
        .mul(BigNumber.from(10000).add(BigNumber.from(margin)))
        .div(BigNumber.from(10000));
}
