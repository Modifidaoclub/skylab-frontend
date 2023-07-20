import {
    Box,
    Center,
    Container,
    Flex,
    Heading,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import dotted1 from "../assets/dotted-1.svg";
import dotted2 from "../assets/dotted-2.svg";
import dotted3 from "../assets/dotted-3.svg";
import graphLine from "../assets/graph-curve-line.svg";
import graphX from "../assets/graph-x.svg";
import graphY from "../assets/graph-y.svg";
import banner from "../assets/home-bg.png";
import welcomeDots from "../assets/welcome-dots.svg";
import bagItems from "../assets/items.svg";
import TextMorph from "../components/TextMorph";
import LandingAnimation from "../components/LandingAnimation";
import CardBanner from "../components/CardBanner";
import AboutBanner from "../components/AboutBanner";
import AboutGameBanner from "../components/AboutGameBanner";
import ConceptBanner from "../components/ConceptBanner";
import MintTimeline from "../components/MintTimeline";
import { randomizeString } from "../utils";

const Home = (): ReactElement => {
    // hooks
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <Container maxW="100%" minH="100vh" p="0">
                <LandingAnimation />
            </Container>
            <Container
                maxW="100%"
                minH="100vh"
                bgGradient="linear-gradient(to bottom left, #000 10%, #02146D 30%, #05126C 40%, #0A116A 50%, #360057)"
            >
                <Container maxW="full">
                    <Center>
                        <AboutBanner />
                    </Center>
                </Container>
                <Container maxW="1500px">
                    <Center>
                        <CardBanner />
                    </Center>
                </Container>
                <Box>
                    <Center>
                        <AboutGameBanner />
                    </Center>
                </Box>
                <Container maxW="1500px">
                    <Center>
                        <ConceptBanner />
                    </Center>
                </Container>
            </Container>
            <Container
                maxW="100%"
                minH="100vh"
                bgGradient="linear-gradient(to bottom right, #360057 10%, #0A116A 50%, #05126C 60%, #02146D 70%, #000)"
                p="0"
            >
                <Container maxW="80%" pt="6%">
                    <Center>
                        <Stack>
                            <Stack alignItems="center" spacing="3%">
                                <Heading whiteSpace="nowrap" fontSize="5vw">
                                    Welcome to Project Mercury
                                </Heading>
                                <Box w="1vw">
                                    <Image
                                        src={welcomeDots}
                                        objectFit="cover"
                                        w="full"
                                    />
                                </Box>
                                <Heading whiteSpace="nowrap" fontSize="3vw">
                                    PvP Strategy Games
                                </Heading>
                                <Box w="90vw">
                                    <Image
                                        src={bagItems}
                                        objectFit="cover"
                                        w="full"
                                    />
                                </Box>
                            </Stack>
                            <Box w="100%">
                                <Box w="5vw" ml="10vw">
                                    <Image
                                        src={dotted1}
                                        objectFit="cover"
                                        w="full"
                                    />
                                </Box>
                            </Box>
                            <Stack spacing="30px">
                                <Box w="100%">
                                    <Heading
                                        ml="-2vw"
                                        whiteSpace="nowrap"
                                        fontSize="4vw"
                                    >
                                        {t("mechanismHint")}
                                    </Heading>
                                </Box>
                                <Flex
                                    justifyContent="space-between"
                                    alignItems="start"
                                    fontSize="2vw"
                                    zIndex={10}
                                >
                                    <Stack>
                                        <TextMorph
                                            morphText="1dn23knxeik"
                                            defaultText="1 + 1 = 2"
                                            selector="hint1"
                                        />
                                        <TextMorph
                                            morphText="ngdu5we791"
                                            defaultText="2 + 2 = 3"
                                            selector="hint2"
                                        />
                                        <TextMorph
                                            morphText="dfa2512789"
                                            defaultText="2 = 1 * 2"
                                            selector="hint3"
                                        />
                                        <TextMorph
                                            morphText="asdfasr12z3"
                                            defaultText="3 = 2 * 2"
                                            selector="hint4"
                                        />
                                    </Stack>
                                    <Stack>
                                        <TextMorph
                                            morphText="ewhew-kl"
                                            defaultText="+ + =  -"
                                            selector="hint5"
                                        />
                                        <TextMorph
                                            morphText="wqihz#iw%!dk_="
                                            defaultText="Fuel != Battery"
                                            selector="hint6"
                                        />
                                    </Stack>
                                    <TextMorph
                                        morphText="ndwh7id"
                                        defaultText=":)"
                                        selector="hint7"
                                    />
                                </Flex>
                            </Stack>
                        </Stack>
                    </Center>
                </Container>
                <Box w="full" minH="100vh" overflow="hidden" pb="30%">
                    <Box pos="relative">
                        <Box w="90vw" top="20vw" pos="absolute">
                            <Image src={graphX} w="full" />
                        </Box>
                        <Box left="45vw" w="2vw" pos="absolute">
                            <Image src={graphY} w="full" />
                        </Box>
                        <Box w="70vw" top="-22vw" left="0vw" pos="absolute">
                            <Image src={graphLine} w="full" />
                        </Box>
                    </Box>
                    <Box pt="53%">
                        <Stack textAlign="center" spacing="-10%">
                            <Heading whiteSpace="nowrap" fontSize="4vw">
                                {t("timeline")}
                            </Heading>
                            <MintTimeline />
                        </Stack>
                    </Box>
                    <Box w="5vw" ml="10vw" mt="2vw">
                        <Image src={dotted2} objectFit="cover" w="full" />
                    </Box>
                    <Stack
                        spacing="5%"
                        minH="300px"
                        pl="15%"
                        w="60vw"
                        fontSize="2vw"
                    >
                        <Box
                            pos="relative"
                            transform="rotate(-1.2deg)"
                            className="wrapRandomText"
                        >
                            <Text pos="absolute" className="randomizedText">
                                {randomizeString(t("haveStrategiesAndFun"))}
                            </Text>
                            <Text pos="absolute" className="hoverActualText">
                                {t("haveStrategiesAndFun")}
                            </Text>
                        </Box>
                        <Box w="5vw">
                            <Image
                                ml="15vw"
                                mt="5vw"
                                src={dotted3}
                                objectFit="cover"
                                w="full"
                            />
                        </Box>
                        <Box
                            className="wrapRandomText"
                            pos="relative"
                            transform="rotate(0.1deg)"
                            w="45vw"
                        >
                            <Text pos="absolute" className="randomizedText">
                                {randomizeString(t("emersonQuote"))}
                            </Text>
                            <Text pos="absolute" className="hoverActualText">
                                {t("emersonQuote")}
                            </Text>
                        </Box>
                    </Stack>
                </Box>
            </Container>
        </React.Fragment>
    );
};

export default Home;
