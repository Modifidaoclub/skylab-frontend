import {
    Box,
    Image,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    useClipboard,
    useDisclosure,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import TutorialIcon from "./assets/tutorial-icon.svg";
import KeyboardIcon from "./assets/keyboard.svg";
import ShareIcon from "./assets/share.svg";
import BidTacToeTutorial from "./BidTacToeTutorial";
import LinkIcon from "./assets/link.svg";
import TwIcon from "./assets/tw.svg";
import QuitModal from "./QuitModal";
import { useGameContext } from "@/pages/TacToe";
import useSkyToast from "@/hooks/useSkyToast";
import { CHAIN_NAMES } from "@/utils/web3Utils";
import useActiveWeb3React from "@/hooks/useActiveWeb3React";
import { shortenAddressWithout0x } from "@/utils";
import UpArrowIcon from "./assets/up-arrow.svg";
import DownArrowIcon from "./assets/down-arrow.svg";
import { useLocation } from "react-router-dom";
import qs from "query-string";

const KeyItem = ({ children }: { children: React.ReactNode }) => {
    return (
        <Box
            sx={{
                height: "1.0417vw",
                mixWidth: "1.0417vw",
                borderRadius: "0.2604vw",
                border: "1px solid #000",
                backgroundColor: "rgba(0, 0, 0, 0.20)",
                width: "3.125vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7292vw",
                fontWeight: "bold",
                padding: "0 0.5208vw",
            }}
        >
            {children}
        </Box>
    );
};
const KeyBoard = () => {
    return (
        <Popover>
            <PopoverTrigger>
                <Box
                    sx={{
                        borderRadius: "0.5208vw",
                        height: "2.3958vw",
                        width: "2.3958vw",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
                        marginRight: "0.7292vw",
                    }}
                >
                    <Image
                        src={KeyboardIcon}
                        sx={{
                            width: "1.9792vw",
                            height: "1.9792vw",
                        }}
                    ></Image>
                </Box>
            </PopoverTrigger>
            <PopoverContent
                sx={{
                    backgroundColor: "#fff",
                    color: "#000",
                    width: "14.5833vw",
                    padding: "0px",
                    "& .chakra-popover__arrow": {
                        background: "#fff !important",
                    },
                    "&:focus": {
                        outline: "none !important",
                        boxShadow: "none !important",
                    },
                }}
            >
                <PopoverArrow />
                <PopoverBody>
                    <Box>
                        <Box sx={{}}>
                            <Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <KeyItem>Shift</KeyItem>
                                        <Text
                                            sx={{
                                                fontSize: "0.7292vw",
                                            }}
                                        >
                                            +
                                        </Text>
                                        <KeyItem>Enter</KeyItem>
                                    </Box>

                                    <Text
                                        sx={{
                                            fontSize: "0.7292vw",
                                            fontWeight: "bold",
                                            width: "5.2083vw",
                                            textAlign: "center",
                                        }}
                                    >
                                        Confirm Bid
                                    </Text>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        marginTop: "0.7813vw",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flex: 1,
                                        }}
                                    >
                                        <Image
                                            src={UpArrowIcon}
                                            sx={{}}
                                        ></Image>
                                    </Box>
                                    <Text
                                        sx={{
                                            fontSize: "0.7292vw",
                                            fontWeight: "bold",
                                            width: "5.2083vw",
                                            textAlign: "center",
                                        }}
                                    >
                                        Add Bid
                                    </Text>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        marginTop: "0.7813vw",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flex: 1,
                                        }}
                                    >
                                        <Image
                                            src={DownArrowIcon}
                                            sx={{}}
                                        ></Image>
                                    </Box>
                                    <Text
                                        sx={{
                                            fontSize: "0.7292vw",
                                            fontWeight: "bold",
                                            width: "5.2083vw",
                                            textAlign: "center",
                                        }}
                                    >
                                        Reduce Bid
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        ></Box>
                    </Box>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

const ShareLink = () => {
    const { chainId } = useActiveWeb3React();
    const { bidTacToeGameAddress, myInfo } = useGameContext();
    const { search } = useLocation();
    const params = qs.parse(search) as any;
    const istest = params.testflight === "true";
    const toast = useSkyToast();
    const inviteLink = useMemo(() => {
        if (!bidTacToeGameAddress) return "";

        const testflight = istest ? "&testflight=true" : "";
        return `${
            window.location.origin
        }/#/tactoe/live?gameAddress=${bidTacToeGameAddress}&chainId=${chainId}&burner=${shortenAddressWithout0x(
            myInfo.burner,
        )}${testflight}`;
    }, [bidTacToeGameAddress, myInfo]);

    const { onCopy } = useClipboard(inviteLink);
    const handleCopyLink = () => {
        onCopy();
        toast("Link copied");
    };
    const handleShareTw = () => {
        const testflight = istest ? "&testflight=true" : "";
        const text = `${
            window.location.host
        }/#/tactoe/live?gameAddress=${bidTacToeGameAddress}&chainId=${chainId}&burner=${shortenAddressWithout0x(
            myInfo.burner,
        )}${testflight}
⭕️❌⭕️❌Watch me play Bid tac toe and crush the opponent！⭕️❌⭕️❌
Bid tac toe, a fully on-chain PvP game of psychology and strategy, on ${
            CHAIN_NAMES[chainId]
        }
(Twitter)@skylabHQ`;

        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        );
    };
    return (
        <Popover defaultIsOpen={true}>
            <PopoverTrigger>
                <Box
                    sx={{
                        borderRadius: "0.5208vw",
                        height: "2.3958vw",
                        width: "2.3958vw",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
                        marginRight: "0.7292vw",
                    }}
                >
                    <Image
                        src={ShareIcon}
                        sx={{
                            width: "1.5625vw",
                            height: "1.5625vw",
                        }}
                    ></Image>
                </Box>
            </PopoverTrigger>
            <PopoverContent
                sx={{
                    backgroundColor: "#fff",
                    color: "#000",
                    width: "11vw",
                    padding: "0px",
                    "& .chakra-popover__arrow": {
                        background: "#fff !important",
                    },
                    "&:focus": {
                        outline: "none !important",
                        boxShadow: "none !important",
                    },
                }}
            >
                <PopoverArrow />
                <PopoverBody>
                    <Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                            onClick={handleCopyLink}
                        >
                            <Image
                                src={LinkIcon}
                                sx={{
                                    marginRight: "0.5208vw",
                                    width: "1.25vw",
                                }}
                            ></Image>
                            <Text
                                sx={{
                                    fontSize: "0.7292vw",
                                    fontWeight: "bold",
                                }}
                            >
                                Copy Live Invite Link
                            </Text>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                            onClick={handleShareTw}
                        >
                            <Image
                                src={TwIcon}
                                sx={{
                                    marginRight: "0.5208vw",
                                    width: "1.25vw",
                                }}
                            ></Image>
                            <Text
                                sx={{
                                    fontSize: "0.7292vw",
                                    fontWeight: "bold",
                                }}
                            >
                                Share Link to Twitter{" "}
                            </Text>
                        </Box>
                    </Box>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

const ToolBar = ({ quitType }: { quitType?: "wait" | "game" }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box
            sx={{
                position: "absolute",
                right: "3.125vw ",
                top: "1.4063vw",

                display: "flex",
                alignItems: "center",
                "& > div": {
                    cursor: "pointer",
                },
            }}
        >
            {quitType === "game" && <KeyBoard></KeyBoard>}
            {quitType === "game" && <ShareLink></ShareLink>}
            <Box
                sx={{
                    borderRadius: "0.5208vw",
                    height: "2.3958vw",
                    width: "2.3958vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                    marginRight: "0.7292vw",
                }}
            >
                <BidTacToeTutorial>
                    <Image
                        src={TutorialIcon}
                        sx={{
                            width: "1.5625vw",
                            height: "1.5625vw",
                        }}
                    ></Image>
                </BidTacToeTutorial>
            </Box>
            <Box
                onClick={onOpen}
                sx={{
                    borderRadius: "0.5208vw",
                    height: "2.3958vw",
                    width: "2.3958vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                }}
            >
                <Text sx={{ fontSize: "0.8333vw" }}>Quit</Text>
            </Box>
            {quitType && (
                <QuitModal
                    isOpen={isOpen}
                    onClose={onClose}
                    quitType={quitType}
                ></QuitModal>
            )}
        </Box>
    );
};

export default ToolBar;
