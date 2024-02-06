import React from 'react'
import App from './App'
import UserProvider from './providers/UserProvider'
import ThemeProvider, {GlobalStyle} from './styles/global'
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./store/store";
import {createRoot} from "react-dom/client";
import EventsProvider from "./providers/EventsProvider";

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <GlobalStyle/>
            <Provider store={store}>
                <UserProvider>
                    <EventsProvider>
                    <BrowserRouter>
                        <App/>
                    </BrowserRouter>
                    </EventsProvider>
                </UserProvider>
            </Provider>
        </ThemeProvider>

    </React.StrictMode>
)
