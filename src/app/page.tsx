"use client"
import React from "react";
import Image from 'next/image'
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NonogramIcon from './components/NonogramIcon';

export default function Page({ }) {

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
  }));

  const theme = createTheme({
    typography: {
      htmlFontSize: 10,
      fontFamily: [
        'DotGothic16',
      ].join(','),
    }
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="mx-auto m-10">
          <Image src="/images/logo.png" alt="logo" width={150} height={150} />
        </div>
        <h1 className="mx-auto">ドット絵ツクール</h1>
        <Box sx={{ flexGrow: 1, maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={10} md={6} className="mx-auto">
              <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/edit`} underline="none">

                <Item>
                  <h2>ドット絵作成</h2>
                  <p>画像からドット絵やお絵描きロジックを作成できる</p>
                  <p>作成後に<NonogramIcon></NonogramIcon>をクリックしてみよう</p>
                  <p>*作成したお絵描きロジックは他の人からも見える</p>
                </Item>
              </Link>
            </Grid>
            <Grid item xs={10} md={6} className="mx-auto">
              <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/nonogram`} underline="none">
                <Item>
                  <h2>お絵描きロジック</h2>
                  <p>自分や他の人が作成したお絵描きロジックに挑戦できる</p>
                  <p>できるかぎり速く解いてみよう</p>
                </Item>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </ThemeProvider>
    </>
  );
}