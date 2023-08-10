import {
    Box,
    Container,
    Image as CharkraImage,
    keyframes,
    Text,
} from "@chakra-ui/react";
import React, { ReactElement, useEffect, useState } from "react";
import LandingAnimation from "../components/LandingAnimation";
import HomeBg from "@/components/Home/assets/homeBg.png";
import CardBanner from "../components/CardBanner";
import ConceptBanner from "../components/ConceptBanner";
import Pillars from "@/components/Home/Pillars";
import LeftNav from "@/components/Home/LeftNav";
import Game from "@/components/Home/Game";
import Skylab from "@/components/Home/Skylab";
import Blog from "@/components/Home/Blog";
import Backed from "@/components/Home/Backed";
import DecorBg from "@/components/Home/assets/decor.gif";
import logo from "@/components/Home/assets/logo.svg";
import qs from "query-string";
import { useLocation } from "react-router-dom";

export const compImg = (index: number) => {
    const index1 = index + 100;
    const url = require(`@/components/Home/assets/comp/Comp ${index1}.png`);
    return url;
};

const Home = (): ReactElement => {
    const { search } = useLocation();

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const params = qs.parse(search) as any;
        const { part } = params;
        if (part === "primitives") {
            const targetDiv = document.getElementById("primitives");
            targetDiv.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [search]);

    useEffect(() => {
        setTimeout(() => {
            let loadedImages = 0;
            const picImg = 59; // 机械手图片数量
            // 监听所有img标签的加载完成事件
            const images = document.querySelectorAll("img");
            const totalImages = images.length;
            const backgroundImgs = 2;

            const allTotal = totalImages + backgroundImgs + picImg;
            const checkAllImagesLoaded = () => {
                loadedImages++;
                setProgress(Math.floor((loadedImages / allTotal) * 100));
                if (loadedImages === allTotal) {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                }
            };

            // 加载机械手图片计数
            const loadRobotEvent = () => {
                const imgList: any = [];
                for (let i = 0; i < picImg; i++) {
                    const img = new Image();
                    img.src = compImg(i);
                    imgList.push(img);
                }
                for (let i = 0; i < picImg; i++) {
                    imgList[i].addEventListener("load", checkAllImagesLoaded);
                }
            };
            loadRobotEvent();

            // 加载所有图片组件计数
            const loadAllImgEvent = () => {
                for (let i = 0; i < totalImages; i++) {
                    images[i].addEventListener("load", checkAllImagesLoaded);
                }
            };
            loadAllImgEvent();

            // 加载背景图片计数
            const loadBackgroundEvent = () => {
                const img = new Image();
                img.src = HomeBg;
                img.addEventListener("load", checkAllImagesLoaded);

                const img1 = new Image();
                img1.src = DecorBg;
                img1.addEventListener("load", checkAllImagesLoaded);
            };
            loadBackgroundEvent();
        }, 0);
    }, []);

    return (
        <Box>
            {loading && (
                <Box
                    sx={{
                        height: "100vh",
                        width: "100vw",
                        position: "fixed",
                        background: "#2A484D",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            border: "2px solid #fff",
                            borderRadius: "50%",
                            width: "125px",
                            height: "125px",
                            "&::after": {
                                content: `"${progress}%"`,
                                position: "absolute",
                                left: "50%",
                                transform: "translateX(-50%)",
                                bottom: "-130px",
                                width: "100%",
                                textAlign: "center",
                                height: "100%",
                                background: "#2A484D",
                                fontSize: "20px",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                            }}
                        >
                            <Box
                                sx={{
                                    width: "125px",
                                    height: "125px",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        width: "14px",
                                        height: "14px",
                                        borderRadius: "50%",
                                        backgroundColor: "#fff",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        top: "-7px",
                                    }}
                                ></Box>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        width: "125px",
                                        height: "125px",
                                        backgroundColor: "transparent",
                                        left: 0,
                                        top: 0,
                                        zIndex: 20,
                                        transform: `rotate(${
                                            (360 * progress) / 100
                                        }deg)`,
                                        transition: "all 0.5s linear",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            width: "14px",
                                            height: "14px",
                                            borderRadius: "50%",
                                            backgroundColor: "#fff",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            top: "-7px",
                                        }}
                                    ></Box>
                                </Box>
                            </Box>
                        </Box>
                        <CharkraImage
                            src={logo}
                            sx={{
                                width: "110px",
                                height: "110px",
                                zIndex: 20,
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%,-50%)",
                            }}
                        ></CharkraImage>

                        <Box
                            sx={{
                                height: "129px",
                                width: "129px",
                                background: "#2A484D",
                                position: "absolute",
                                left: "-2px",
                                top: 0,
                                transform: `translateY(${progress}%)`,
                            }}
                        ></Box>
                    </Box>
                </Box>
            )}

            <Box
                sx={{
                    backgroundImage: `url(${DecorBg}), url(${HomeBg})`,
                    backgroundRepeat: "no-repeat, no-repeat",
                    backgroundSize: "contain,cover",
                    backgroundPosition: "0 0,0 0",
                    fontFamily: "Orbitron",
                    "& img": {
                        imageRendering: "optimizeContrast",
                    },
                }}
                id="home"
                opacity={loading ? "0" : "1"}
            >
                <LeftNav></LeftNav>
                <Box sx={{}}>
                    <Container
                        maxW="100%"
                        minH="100vh"
                        sx={{ paddingBottom: "150px" }}
                    >
                        <LandingAnimation />
                    </Container>
                    <Container maxW="100%" minH="100vh">
                        <Game></Game>
                    </Container>
                    <Container
                        maxW="100%"
                        minH="100vh"
                        sx={{ paddingBottom: "150px" }}
                    >
                        <CardBanner />
                    </Container>
                    <Container
                        maxW="100%"
                        minH="100vh"
                        sx={{ paddingBottom: "150px" }}
                    >
                        <ConceptBanner />
                    </Container>
                </Box>
                <Box>
                    <Container maxW="100%" minH="100vh">
                        <Pillars />
                    </Container>
                    <Container maxW="100%" minH="100vh">
                        <Skylab></Skylab>
                    </Container>
                    <Container
                        maxW="100%"
                        minH="100vh"
                        sx={{ paddingBottom: "150px" }}
                    >
                        <Blog></Blog>
                    </Container>
                    <Container maxW="100%" minH="100vh">
                        <Backed></Backed>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
