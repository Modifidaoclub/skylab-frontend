import { Box, Grid, Text, Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MyUserCard, OpUserCard } from "./UserCard";
import CircleIcon from "@/components/TacToe/assets/circle.svg";
import XIcon from "@/components/TacToe/assets/x.svg";
import { BoardGrid } from "@/components/TacToe/Board";
import BaseGrid from "./assets/base-grid.svg";
import { useTour } from "@reactour/tour";
import TutorialIcon from "./assets/tutorial-icon.svg";
import { GameState } from ".";
import { UserMarkType } from "@/pages/TacToe";

const FirstBoard = () => {
    const list = [
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 1,
            myValue: 12,
            opValue: 10,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 6,
            opValue: 8,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 5,
            opValue: 8,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 1,
            myValue: 7,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 1,
            myValue: 10,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
    ];

    return (
        <Box
            sx={{
                background: `url(${BaseGrid})`,
                backgroundSize: "100% 100%",
            }}
        >
            <Grid
                templateColumns="repeat(3, 1fr)"
                templateRows="repeat(3, 1fr)"
                w={"501px"}
                h={"501px"}
                sx={{
                    position: "relative",
                }}
            >
                {list.map((item, index) => {
                    return (
                        <BoardGrid
                            key={index}
                            mark={item.mark}
                            myValue={item.myValue}
                            opValue={item.opValue}
                            myMark={item.myMark}
                            opMark={item.opMark}
                        ></BoardGrid>
                    );
                })}

                <Box
                    className="btt-fourth-step"
                    sx={{
                        width: "156px",
                        height: "16px",
                        position: "absolute",
                        top: "315px",
                        right: "50%",
                        transform: "translateX(50%)",
                    }}
                ></Box>
            </Grid>
        </Box>
    );
};

const SecondBoard = () => {
    const list = [
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 1,
            myValue: 6,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 9,
            opValue: 6,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 4,
            opValue: 10,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 14,
            opValue: 12,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: -1,
            myValue: 0,
            opValue: 0,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 12,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
    ];

    return (
        <Box
            sx={{
                background: `url(${BaseGrid})`,
                backgroundSize: "100% 100%",
            }}
        >
            <Grid
                templateColumns="repeat(3, 1fr)"
                templateRows="repeat(3, 1fr)"
                w={"501px"}
                h={"501px"}
                sx={{
                    position: "relative",
                }}
            >
                {list.map((item, index) => {
                    return (
                        <BoardGrid
                            key={index}
                            mark={item.mark}
                            myValue={item.myValue}
                            opValue={item.opValue}
                            myMark={item.myMark}
                            opMark={item.opMark}
                        ></BoardGrid>
                    );
                })}
                <Box
                    className="btt-fifth-step"
                    sx={{
                        width: "157px",
                        height: "501px",
                        position: "absolute",
                        top: 0,
                        right: 0,
                    }}
                ></Box>
            </Grid>
        </Box>
    );
};

const ThirdBoard = () => {
    const list = [
        {
            mark: 3,
            myValue: 12,
            opValue: 7,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 16,
            opValue: 5,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 4,
            opValue: 9,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 9,
            opValue: 20,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 11,
            opValue: 24,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 12,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 15,
            opValue: 3,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 2,
            myValue: 12,
            opValue: 24,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
        {
            mark: 3,
            myValue: 9,
            opValue: 4,
            myMark: UserMarkType.Circle,
            opMark: UserMarkType.Cross,
        },
    ];

    return (
        <Box
            sx={{
                background: `url(${BaseGrid})`,
                backgroundSize: "100% 100%",
            }}
            className="btt-sixth-step"
        >
            <Grid
                templateColumns="repeat(3, 1fr)"
                templateRows="repeat(3, 1fr)"
                w={"501px"}
                h={"501px"}
                sx={{
                    position: "relative",
                }}
            >
                {list.map((item, index) => {
                    return (
                        <BoardGrid
                            key={index}
                            mark={item.mark}
                            myValue={item.myValue}
                            opValue={item.opValue}
                            myMark={item.myMark}
                            opMark={item.opMark}
                        ></BoardGrid>
                    );
                })}
            </Grid>
        </Box>
    );
};

const Timer = () => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                width: "fit-content",
                left: "50%",
                transform: "translateX(-50%)",
            }}
        >
            <Box
                sx={{
                    border: "3px solid #FFF",
                    width: "412px",
                    background: "transparent",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0 7px",
                }}
            >
                <Box
                    sx={{
                        height: "25px",
                        width: "30%",
                        background: "#fff",
                    }}
                ></Box>
            </Box>
            <Text
                sx={{
                    fontSize: "36px",
                    position: "absolute",
                    right: "-140px",
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            >
                01:30
            </Text>
        </Box>
    );
};

const ToolBar = () => {
    return (
        <Box
            sx={{
                position: "absolute",
                right: "20px",
                top: "20px",
                display: "flex",
                alignItems: "center",
                "& > div": {
                    cursor: "pointer",
                },
            }}
        >
            <Box
                sx={{
                    borderRadius: "18px",
                    height: "58px",
                    width: "58px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                    marginRight: "14px",
                }}
            >
                <Image src={TutorialIcon} sx={{ height: "40px" }}></Image>
            </Box>
            <Box
                sx={{
                    borderRadius: "18px",
                    height: "58px",
                    width: "58px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                }}
            >
                <Text sx={{ fontSize: "28px" }}>Quit</Text>
            </Box>
        </Box>
    );
};

const TacToeTutorial = ({}) => {
    const { currentStep, setIsOpen } = useTour();

    useEffect(() => {
        setTimeout(() => {
            setIsOpen(true);
        }, 100);
    }, []);

    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                inset: 0,
                padding: "27px 60px",
                background: "#303030",
                zIndex: 100,
                position: "absolute",
                left: 0,
                top: 0,
            }}
        >
            <Box
                sx={{
                    height: "58px",
                    position: "relative",
                }}
            >
                <Timer></Timer>
                <ToolBar></ToolBar>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12vh",
                }}
            >
                <MyUserCard
                    showTutorialStep
                    status="my"
                    showAdvantageTip
                    markIcon={CircleIcon}
                    level={1}
                    address={"0x2f49Be6976324000da4Bd091B0217E217b81A93d"}
                    balance={
                        [0, 1, 2].includes(currentStep)
                            ? 60
                            : currentStep === 3
                            ? 55
                            : 0
                    }
                    bidAmount={15}
                ></MyUserCard>
                {[0, 1, 2].includes(currentStep) && <FirstBoard></FirstBoard>}
                {currentStep === 3 && <SecondBoard></SecondBoard>}
                {currentStep === 4 && <ThirdBoard></ThirdBoard>}
                <OpUserCard
                    status="op"
                    markIcon={XIcon}
                    level={1}
                    address={"0x40BA69df5c58A1106480b42aFEF78DA08860081c"}
                    balance={
                        [0, 1, 2].includes(currentStep)
                            ? 64
                            : currentStep == 3
                            ? 64
                            : 0
                    }
                    bidAmount={15}
                    opGameState={GameState.WaitingForBid}
                ></OpUserCard>
            </Box>
        </Box>
    );
};

export default TacToeTutorial;
