import {
    Box,
    Image,
    NumberInput,
    NumberInputField,
    Text,
    useDisclosure,
    Button,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import OldWhite from "./assets/old-white.svg";
import OldYellow from "./assets/old-yellow.svg";
import FindYellow from "./assets/find-yellow.svg";
import FindWhite from "./assets/find-white.svg";
import BabymercIcon from "./assets/babymerc.svg";
import RightArrowBlackIcon from "./assets/right-arrow-black.svg";
import { ChainId } from "@/utils/web3Utils";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import {
    getMultiERC721Contract,
    getMultiProvider,
    useMultiERC721Contract,
    useMultiMercuryPilotsContract,
    useMultiProvider,
} from "@/hooks/useMultiContract";
import { getMetadataImg, getPilotImgFromUrl } from "@/utils/ipfsImg";
import { useMercuryPilotsContract } from "@/hooks/useContract";
import BackHomeButton from "./BackHomeButton";
import Loading from "../Loading";
import useSkyToast from "@/hooks/useSkyToast";
import { handleError } from "@/utils/error";
import { PilotInfo, usePilotInfo } from "@/hooks/usePilotInfo";
import UnkowPilotIcon1 from "./assets/unknow-pilot1.svg";
import styled from "@emotion/styled";
import { MyPilotXp, PilotXp } from "./PilotXp";
import ExchangeIcon from "./assets/exchange.svg";
import MyPilot from "./MyPilot";
import Nav2NFT from "./Nav2NFT";
import AllPilotList from "@/skyConstants/pilots";

const ActivePilot = ({ selectPilotInfo }: { selectPilotInfo: PilotInfo }) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
            }}
        >
            {selectPilotInfo.img ? (
                <Image
                    src={selectPilotInfo.img}
                    sx={{
                        width: "4.4271vw",
                        height: "4.4271vw",
                        marginRight: "1.3542vw",
                        borderRadius: "20px",
                        border: "3px solid #fff",
                    }}
                ></Image>
            ) : (
                <Image
                    src={UnkowPilotIcon1}
                    sx={{
                        width: "4.4271vw",
                        height: "4.4271vw",
                        marginRight: "1.3542vw",
                        borderRadius: "20px",
                    }}
                ></Image>
            )}
        </Box>
    );
};

const RegisteredPilot = ({
    handleSelectTokenId,
}: {
    handleSelectTokenId: (value: PilotInfo) => void;
}) => {
    const { account, chainId } = useActiveWeb3React();
    const [recentlyActivePilots, setRecentlyActivePilots] = useState([]);
    const mercuryPilotsContract = useMercuryPilotsContract();
    const multiMercuryPilotsContract = useMultiMercuryPilotsContract();
    const multiProvider = useMultiProvider(chainId);
    const [loading, setLoading] = useState(false);

    const handleGetRecentlyUsedPilot = async () => {
        try {
            setLoading(true);
            const recentlyActivePilots =
                await mercuryPilotsContract.getRecentlyActivePilots(account);

            const uniquePilots = _.uniqBy(
                recentlyActivePilots,
                (item: any) => `${item.collectionAddress}-${item.tokenId}`,
            );

            const p = [];
            for (let i = 0; i < uniquePilots.length; i++) {
                const multiERC721Contract = getMultiERC721Contract(
                    uniquePilots[i].collectionAddress,
                );
                p.push(multiERC721Contract.tokenURI(uniquePilots[i].pilotId));
                p.push(
                    multiMercuryPilotsContract.getPilotMileage(
                        uniquePilots[i].collectionAddress,
                        uniquePilots[i].pilotId,
                    ),
                );
            }

            const res = await multiProvider.all(p);
            setRecentlyActivePilots(
                uniquePilots.map((item, index) => {
                    return {
                        address: item.collectionAddress,
                        tokenId: item.pilotId.toNumber(),
                        img: getMetadataImg(res[index * 2]),
                        xp: res[index * 2 + 1].toNumber(),
                    };
                }),
            );
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!account || !mercuryPilotsContract) {
            return;
        }
        handleGetRecentlyUsedPilot();
    }, [account, mercuryPilotsContract]);

    return (
        <Box>
            <Box
                sx={{
                    width: "49.6354vw",
                    height: "27.7083vw",
                    backdropFilter: "blur(5px)",
                    border: "2px solid #fff",
                    borderRadius: "0.8333vw",
                    display: "flex",
                    padding: "2.0833vw",
                    marginTop: "3.125vw",
                    position: "relative",
                }}
            >
                <Grid
                    templateColumns="repeat(5, 1fr)"
                    templateRows={"repeat(3, 1fr)"}
                    sx={{
                        width: "100%",
                    }}
                >
                    {loading ? (
                        <Loading></Loading>
                    ) : (
                        recentlyActivePilots.map((item) => {
                            return (
                                <GridItem
                                    key={item.address + "-" + item.tokenId}
                                    w="100%"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexDirection: "column",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        handleSelectTokenId({
                                            address: item.address,
                                            tokenId: item.tokenId,
                                            img: item.img,
                                        });
                                    }}
                                >
                                    <Image
                                        src={item.img}
                                        sx={{
                                            width: "3.4375vw",
                                            height: "3.4375vw",
                                            border: "1px solid #fff",
                                            borderRadius: "10px",
                                        }}
                                    ></Image>
                                    <PilotXp value={item.xp}></PilotXp>
                                    <Text
                                        sx={{
                                            fontSize: "0.8333vw",
                                        }}
                                    >
                                        #{item.tokenId}
                                    </Text>
                                </GridItem>
                            );
                        })
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

const CustomButton = styled(Button)`
    width: 13.4375vw;
    height: 3.125vw;
    border-radius: 1.5625vw;
    font-size: 1.25vw;
    font-weight: 900;
    background: #d9d9d9;
    color: #000;
    &[disabled] {
        color: #636363;
        background: #ababab;
    }
    &[disabled]:hover {
        color: #636363;
        background: #ABABAB;
    },
`;

const PilotItem = ({
    onClick,
    img,
    name,
}: {
    onClick: () => void;
    img: string;
    name: string;
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "0.5208vw",
                border: "1px solid #FFF",
                background: "rgb(182, 200, 202)",
                width: "20.8333vw",
                height: "4.2708vw",
                position: "relative",
                paddingLeft: "0.5208vw",
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            <Image
                src={img}
                sx={{
                    width: "3.0208vw",
                    height: "3.0208vw",
                }}
            ></Image>
            <Text
                sx={{
                    textAlign: "center",
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "1.0417vw",
                    color: "#4A4A4A",
                }}
            >
                {name}
            </Text>
        </Box>
    );
};

const SelectPilotCollections = ({
    currentCollection,
    inputTokenId,
    handleInputTokenId,
    handleSelectTokenId,
    handlePilotIndex,
}: {
    currentCollection: any;
    inputTokenId: string;
    handleInputTokenId: (value: string) => void;
    handleSelectTokenId: (value: PilotInfo) => void;
    handlePilotIndex: (value: number) => void;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { chainId, account } = useActiveWeb3React();
    const [currentMyNfts, setCurrentMyNfts] = useState([]);
    const [loading, setLoading] = useState(false);

    const multiERC721Contract = useMultiERC721Contract(
        currentCollection.address,
    );

    const multiProvider = useMultiProvider(currentCollection.chainId);

    const handleSelectSeries = (index: number) => {
        handlePilotIndex(index);
        onClose();
    };

    const handleGetAllNft = async () => {
        setLoading(true);
        const [balance] = await multiProvider.all([
            multiERC721Contract.balanceOf(account),
        ]);

        // get all tokenId
        const tokenIds = await multiProvider.all(
            new Array(balance.toNumber()).fill("").map((item, index) => {
                return multiERC721Contract.tokenOfOwnerByIndex(account, index);
            }),
        );
        // get all tokenURI
        const tokenURIs = await multiProvider.all([
            ...tokenIds.map((item) => {
                return multiERC721Contract.tokenURI(item);
            }),
        ]);

        setCurrentMyNfts(
            tokenIds.map((item, index) => {
                return {
                    tokenId: item.toNumber(),
                    img: getMetadataImg(tokenURIs[index]),
                };
            }),
        );
        setLoading(false);
    };

    useEffect(() => {
        if (!currentCollection.enumerable) {
            return;
        }
        handleGetAllNft();
    }, [currentCollection]);

    return (
        <Box>
            <Text
                sx={{
                    fontSize: "1.0417vw",
                    cursor: isOpen ? "pointer" : "default",
                }}
                onClick={() => {
                    if (isOpen) {
                        onClose();
                    }
                }}
            >
                {isOpen
                    ? "< Choose Pilot from Below"
                    : "Select Pilot from these colletions"}
            </Text>
            <Box
                sx={{
                    position: "relative",
                    marginTop: "0.8333vw",
                }}
            >
                {isOpen ? (
                    <Box
                        sx={{
                            position: "absolute",
                            left: "0%",
                            top: "0%",
                        }}
                    >
                        {AllPilotList[chainId].map(
                            (item: any, index: number) => {
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            marginBottom: "0.3125vw",
                                        }}
                                    >
                                        <PilotItem
                                            onClick={() => {
                                                handleSelectSeries(index);
                                            }}
                                            img={item.img}
                                            name={item.name}
                                        ></PilotItem>
                                    </Box>
                                );
                            },
                        )}
                    </Box>
                ) : (
                    <PilotItem
                        onClick={onOpen}
                        img={currentCollection.img}
                        name={currentCollection.name}
                    ></PilotItem>
                )}

                {!isOpen && (
                    <Box
                        sx={{
                            marginTop: "0.8333vw",
                        }}
                    >
                        {currentCollection.enumerable ? (
                            <Box
                                sx={{
                                    width: "532px",
                                    minHeight: "208px",
                                    borderRadius: "16px",
                                    border: "2px solid #fff",
                                    background: "rgba(61, 61, 61, 0.10)",
                                    position: "relative",
                                }}
                            >
                                <Grid
                                    templateColumns="repeat(5, 1fr)"
                                    sx={{
                                        width: "100%",
                                        padding: "20px",
                                    }}
                                >
                                    {loading ? (
                                        <Loading></Loading>
                                    ) : (
                                        currentMyNfts.map((item) => {
                                            return (
                                                <GridItem
                                                    key={item.tokenId}
                                                    onClick={() => {
                                                        console.log("---+++", {
                                                            address:
                                                                currentCollection.address,
                                                            tokenId:
                                                                item.tokenId,
                                                            img: item.img,
                                                        });
                                                        handleSelectTokenId({
                                                            address:
                                                                currentCollection.address,
                                                            tokenId:
                                                                item.tokenId,
                                                            img: item.img,
                                                        });
                                                    }}
                                                    w="100%"
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                        flexDirection: "column",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Image
                                                        src={item.img}
                                                        sx={{
                                                            width: "68px",
                                                            height: "68px",
                                                            borderRadius:
                                                                "10px",
                                                            border: "3px solid #fff",
                                                        }}
                                                    ></Image>
                                                    <Text>
                                                        {" "}
                                                        {item.tokenId}{" "}
                                                    </Text>
                                                </GridItem>
                                            );
                                        })
                                    )}
                                </Grid>
                            </Box>
                        ) : (
                            <Box>
                                <Text
                                    sx={{
                                        fontSize: "1.0417vw",
                                        marginTop: "1.875vw",
                                    }}
                                >
                                    In-put Token Id
                                </Text>
                                <NumberInput
                                    variant="unstyled"
                                    sx={{
                                        borderRadius: "0.2604vw",
                                        background: "#D9D9D9",
                                        color: "#000",
                                        paddingLeft: "0.5208vw",
                                        width: "20.8333vw",
                                        height: "2.0833vw",
                                        marginTop: "0.8333vw",
                                        lineHeight: "2.0833vw",
                                        fontSize: "1.0417vw",
                                    }}
                                    value={inputTokenId}
                                    onChange={(value) => {
                                        handleInputTokenId(value);
                                    }}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

const IndicateNav = ({
    onNextRound,
}: {
    onNextRound: (step: number | string) => void;
}) => {
    return (
        <Box
            sx={{
                width: "12.5vw",
                position: "absolute",
                bottom: "0",
                left: "0",
            }}
        >
            {/* <Text
                sx={{
                    fontSize: "1.0417vw",
                    fontFamily: "Quantico",
                }}
            >
                If you do not have any pilot, mint a Baby Merc:
            </Text>
            <Nav2NFT
                icon={BabyMercIcon}
                title={"Mint"}
                value={"Baby Merc"}
                onClick={() => {
                    onNextRound("babyMerc");
                }}
                sx={{
                    width: "12.5vw  !important",
                }}
            ></Nav2NFT> */}
            <Box
                sx={{
                    marginTop: "1.6667vw",
                    width: "12.5vw",
                    height: "2.7083vw",
                    flexShrink: 0,
                    borderRadius: "0.7813vw",
                    display: "flex",
                    padding: "0 0.5208vw",
                    background:
                        "linear-gradient(95deg, rgba(143, 255, 249, 0.00) 29.09%, rgba(251, 209, 97, 0.80) 60.98%, rgba(251, 209, 97, 0.00) 89.72%)",
                    boxShadow:
                        "0.2083vw 0.2083vw 0.2083vw 0vw rgba(0, 0, 0, 0.25)",
                    border: "2px solid #FFF",
                }}
            >
                <Image
                    src={BabymercIcon}
                    sx={{
                        marginRight: "0.2604vw",
                        width: "1.5625vw",
                    }}
                ></Image>
                <Box
                    sx={{
                        color: "#fff",
                        fontSize: "1.0417vw",
                        flex: 1,
                        fontWeight: "900",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text>Leaderboard</Text>
                        <Box
                            sx={{
                                borderLeft:
                                    "0.0521vw solid rgba(96, 96, 96, 0.30)",
                                paddingLeft: "0.2083vw",
                            }}
                        >
                            <Image
                                sx={{
                                    width: "1.1458vw",
                                }}
                                src={RightArrowBlackIcon}
                            ></Image>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const LeftContent = ({
    handleTabChange,
    value,
}: {
    value: number;
    handleTabChange: (value: number) => void;
}) => {
    const tabList = [
        {
            icon: FindWhite,
            activeIcon: FindYellow,
            label: "Find My Pilot",
        },
        {
            icon: OldWhite,
            activeIcon: OldYellow,
            label: "Registered Pilot",
        },
    ];

    return (
        <Box
            sx={{
                width: "17.1875vw",
                marginRight: "7.5vw",
                "& >div": {
                    marginBottom: "0.7813vw",
                },
                "& >div:last-child": {
                    marginBottom: "0",
                },
            }}
        >
            {tabList.map((item, index) => {
                return (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => handleTabChange(index)}
                    >
                        <Image
                            src={index === value ? item.activeIcon : item.icon}
                            sx={{
                                marginRight: "1.0417vw",
                                width: "3.125vw",
                                height: "3.125vw",
                            }}
                        ></Image>
                        <Text
                            sx={{
                                fontSize: "1.0417vw",
                                fontWeight: 900,
                                color: index === value ? "#f2d861" : "#fff",
                            }}
                        >
                            {item.label}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
};

export interface SelectPilotInfo {
    address: string;
    tokenId: number;
    img?: string;
    xp?: number;
}

const CurrentPilot = ({
    onNextRound,
}: {
    onNextRound: (step: number | string) => void;
}) => {
    const toast = useSkyToast();
    const { account, chainId } = useActiveWeb3React();

    const mercuryPilotsContract = useMercuryPilotsContract();

    const [activeLoading, setActiveLoading] = useState(false);
    const [currentTab, setCurrentTab] = React.useState(0);
    const pilotList = AllPilotList[chainId];

    const { activePilot, handleGetActivePilot } = usePilotInfo(account);
    const [inputTokenId, setInputTokenId] = useState("");
    const [pilotIndex, setPilotIndex] = useState(0);

    const currentCollection = useMemo(() => {
        return pilotList[pilotIndex];
    }, [pilotIndex]);

    const [selectPilotInfo, setSelectPilotInfo] = useState<PilotInfo>({
        address: currentCollection.address,
        tokenId: 0,
        img: "",
        owner: "",
    });

    const handleInputTokenId = (value: string) => {
        setInputTokenId(value);
    };

    const handlePilotIndex = (value: number) => {
        setPilotIndex(value);
        setSelectPilotInfo({
            address: pilotList[value].address,
            tokenId: 0,
            img: "",
        });
    };

    const handleTabChange = (value: number) => {
        setCurrentTab(value);
    };

    const handleSelectTokenId = (value: PilotInfo) => {
        setSelectPilotInfo(value);
    };
    const handleSearchTokenId = async () => {
        try {
            const multiERC721Contract = getMultiERC721Contract(
                currentCollection.address,
            );

            const multiProvider = getMultiProvider(currentCollection.chainId);

            const [tokenURI, owner] = await multiProvider.all([
                multiERC721Contract.tokenURI(inputTokenId),
                multiERC721Contract.ownerOf(inputTokenId),
            ]);

            console.log(tokenURI, "tokenURI");
            // if (owner !== account) {
            //     toast("You are not owner of this NFT.");

            //     return;
            // }

            const img = await getPilotImgFromUrl(tokenURI);
            console.log(img, "img多久");
            handleSelectTokenId({
                ...selectPilotInfo,
                tokenId: Number(inputTokenId),
                img,
                owner,
            });
        } catch (e) {
            console.log(e, "e");
            toast("TokenId is not exist.");
        }
    };

    const handleSetActive = async () => {
        console.log(selectPilotInfo, "selectPilotInfo");
        try {
            if (
                selectPilotInfo.address === "" ||
                selectPilotInfo.tokenId === 0
            ) {
                return;
            }
            setActiveLoading(true);
            const res = await mercuryPilotsContract.setActivePilot(
                selectPilotInfo.address,
                selectPilotInfo.tokenId,
                account,
            );
            await res.wait();
            setActiveLoading(false);
            setSelectPilotInfo({
                address: "",
                tokenId: 0,
                img: "",
            });
            handleGetActivePilot();
        } catch (e) {
            toast(handleError(e));
            setActiveLoading(false);
        }
    };

    return (
        <Box
            sx={{
                padding: "12.963vh 0 8.3333vh",
                height: "100vh",
            }}
        >
            <BackHomeButton onClick={() => onNextRound(2)}></BackHomeButton>
            {activeLoading && <Loading></Loading>}
            <Box
                sx={{
                    width: "83.3333vw",
                    margin: "0 auto",
                    borderTop: "1px solid #fff",
                    position: "relative",
                    paddingTop: "1.8519vh",
                    height: "100%",
                }}
            >
                <Box>
                    <Text
                        sx={{
                            fontSize: "1.25vw",
                        }}
                    >
                        Current Pilot{" "}
                    </Text>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: "1.8519vh",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                marginRight: "2.6875vw",
                                width: "17.1875vw",
                            }}
                        >
                            <MyPilot
                                img={activePilot.img}
                                showSupport={activePilot.owner !== account}
                                sx={{
                                    width: "4.8958vw !important",
                                    height: "4.8958vw !important",
                                    marginRight: "0.5208vw",
                                }}
                            ></MyPilot>

                            {activePilot.tokenId > 0 && (
                                <Box>
                                    <Text
                                        sx={{
                                            fontSize: "1.0417vw",
                                            lineHeight: "1.0417vw",
                                            height: "1.0417vw",
                                        }}
                                    >
                                        {activePilot.name}{" "}
                                        {activePilot.tokenId
                                            ? activePilot.tokenId
                                            : ""}
                                    </Text>
                                    <MyPilotXp
                                        value={activePilot?.xp}
                                    ></MyPilotXp>
                                </Box>
                            )}
                        </Box>
                        <Image
                            src={ExchangeIcon}
                            sx={{
                                height: "2.0313vw",
                                marginRight: "2.6875vw",
                                width: "2.0313vw",
                            }}
                        ></Image>
                        {/* <ActivePilot
                            selectPilotInfo={selectPilotInfo}
                        ></ActivePilot> */}
                        <MyPilot
                            img={selectPilotInfo.img}
                            showSupport={selectPilotInfo.owner !== account}
                            sx={{
                                width: "4.8958vw !important",
                                height: "4.8958vw !important",
                                marginRight: "0.5208vw",
                            }}
                        ></MyPilot>
                    </Box>

                    <Box sx={{ display: "flex", paddingTop: "2.3148vh" }}>
                        <LeftContent
                            value={currentTab}
                            handleTabChange={handleTabChange}
                        ></LeftContent>

                        <Box
                            sx={{
                                flex: 1,
                            }}
                        >
                            {currentTab === 0 && (
                                <SelectPilotCollections
                                    currentCollection={currentCollection}
                                    inputTokenId={inputTokenId}
                                    handleInputTokenId={handleInputTokenId}
                                    handlePilotIndex={handlePilotIndex}
                                    handleSelectTokenId={handleSelectTokenId}
                                ></SelectPilotCollections>
                            )}
                            {currentTab === 1 && (
                                <RegisteredPilot
                                    handleSelectTokenId={handleSelectTokenId}
                                ></RegisteredPilot>
                            )}
                        </Box>
                    </Box>
                </Box>
                <IndicateNav onNextRound={onNextRound}></IndicateNav>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                    }}
                >
                    {currentTab === 0 && !currentCollection.enumerable && (
                        <CustomButton
                            variant="unstyled"
                            onClick={handleSearchTokenId}
                            sx={{
                                marginRight: "44px",
                            }}
                        >
                            Search
                        </CustomButton>
                    )}
                    <CustomButton
                        disabled={false}
                        variant="unstyled"
                        onClick={handleSetActive}
                    >
                        Set Active
                    </CustomButton>
                </Box>
            </Box>
        </Box>
    );
};

export default CurrentPilot;
