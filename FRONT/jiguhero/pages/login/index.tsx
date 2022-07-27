import Head from "next/head"
import Link from "next/link"
import styled from "styled-components"
import KakaoImg from '/public/kakao_login.png';
import Image from 'next/image';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
const IndexText = styled('div')`
  margin: 1rem;
`
const LoginWrapper = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
`
const LoginText = styled('h1')`
  display:flex;
  justify-content: center;
  align-items: center;
  margin: 3rem;
`
const SnsLoginText = styled('span')`
  display:flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
`
const SnsLoginKakao = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  
`

export default function Login() {
  return (
    <>
      <IndexText>
        <ArrowBackIosNewRoundedIcon />
      </IndexText>

      <LoginWrapper>
        {/* header 추가 */}
        <Head>
          <title>로그인 | 지구-방위대</title>
        </Head>
        <main>

          <LoginText>로그인</LoginText>
          <SnsLoginText>
            SNS 계정으로 로그인하기
          </SnsLoginText>
          <SnsLoginKakao>
            <Image src={KakaoImg} />
          </SnsLoginKakao>

        </main>
      </LoginWrapper>
    </>
  );
};

