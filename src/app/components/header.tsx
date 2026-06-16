'use client'

import { useState } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

const drawerWidth = 240;

interface Props {
    /**
     * Injected by the documentation to work in an iframe.
     * Remove this when copying and pasting into your project.
     */
    window?: () => Window;
}
const Header = (props: Props) => {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };
    const theme = createTheme({
        typography: {
            fontFamily: [
                'DotGothic16',
            ].join(','),
            fontSize:
                20
            ,
            fontWeightRegular: 600
        }
    });
    const container = window !== undefined ? () => window().document.body : undefined;
    const drawer = (
        <ThemeProvider theme={theme}>
            <List sx={{
                display: { sm: 'flex' }, textWrap: 'nowrap'
            }}>
                <ListItem disablePadding>
                    <ListItemButton component="a" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/edit`}>
                        <ListItemText primary="ドット絵作成" />
                    </ListItemButton>
                </ListItem >
                <ListItem disablePadding>
                    <ListItemButton component="a" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/nonogram`}>
                        <ListItemText primary="お絵描きロジック" />
                    </ListItemButton>
                </ListItem>
            </List >
        </ThemeProvider >
    );
    return (
        <header className="no-print">
            <div className="container">
                <div>
                    <Link href="/">
                        <Image src="/images/logo.png" alt="logo" width={100} height={100} />
                    </Link>
                    <Box
                        component="nav"
                        sx={{ flexShrink: { sm: 0 } }}
                        aria-label="mailbox folders"
                    >
                        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                        <Drawer
                            anchor={'right'}
                            container={container}
                            variant="temporary"
                            open={mobileOpen}
                            onTransitionEnd={handleDrawerTransitionEnd}
                            onClose={handleDrawerClose}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}
                            sx={{
                                display: { xs: 'block', sm: 'none' },
                                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                            }}
                        >
                            {drawer}
                        </Drawer>
                        <Box
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            {drawer}
                        </Box>
                    </Box>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, marginLeft: 'auto' }}
                    >
                        <MenuIcon sx={{ fontSize: 30 }} />
                    </IconButton>
                </div>
            </div>
        </header>
    )
}

export default Header