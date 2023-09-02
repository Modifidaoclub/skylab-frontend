import React, { ReactElement, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Game from "./pages/Game";
import Garden from "./pages/Garden";
import Attack from "./pages/Attack";
import Tutorial from "./pages/Tutorial";
import Mercury from "./pages/Mercury";
import Keyboard from "./pages/Keyboard";
import Distance from "./pages/Distance";
import SpendResource from "./pages/SpendResource";
import TacToe from "./pages/TacToe";
import TacToeMode from "./pages/TacToeMode";

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return <></>;
};

const AppRoutes = (): ReactElement => {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="mint" element={<Mint />} />
                <Route path="game" element={<Game />} />
                <Route path="game/tutorial" element={<Tutorial />} />
                <Route path="game/keyboard" element={<Keyboard />} />
                <Route path="game/distance" element={<Distance />} />
                <Route path="garden" element={<Garden />} />
                <Route path="attack" element={<Attack />} />
                <Route path="trailblazer" element={<Mercury />} />
                <Route path="spendresource" element={<SpendResource />} />
                <Route path="/tactoe/game" element={<TacToe />}></Route>
                <Route path="/tactoe/mode" element={<TacToeMode />}></Route>
                {/* <Route path="bag" element={<Bag />} /> */}
            </Route>
        </Routes>
    );
};

export default AppRoutes;
