import BackTitle from 'components/back';
import styled from 'styled-components';
import getAllGround from 'pages/api/ground/getAllGround';
import { useEffect, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Paigination from 'components/pagination';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {ButtonFull, ParentsDiv} from 'styles/styled';
import { ConIcon } from 'pages/ecomarket';
import Head from 'next/head';
import { useRecoilState } from 'recoil';
import getPlaceList from 'pages/api/ground/getPlaceList';
import {groundDetail, groundPlaceList, isLikeGround} from 'states/ground';

const Grid = styled('div')`
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    @media only screen and (max-width: 650px) {
        grid-template-columns: repeat(2, 1fr);
  }
  margin: 20px 25px;
`
const GroundItem = styled('div')`
    border: 1px solid #65ace2;
    padding:20px;
    border-radius: 20px;
    margin: 20px 10px;
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height:90%;
`
const GroundTitle = styled('p')`
    margin:5px auto;
    font-weight: bold;
    font-size: 15px;
    word-break: keep-all;
    text-align: center;
`
const GroundIcon = styled('p')`
    margin:0;
    font-size:25px;
`
const GroundPlaceLength = styled('p')`
    margin:0;
    font-size:13px;
`
const GroundTop = styled('div')`
margin-left:35px;
@media only screen and (max-width: 650px) {
    margin-top:20px;
  }
`
const Input = styled('input')`
border-radius:10px;
border: 1px solid #888888;
height:40px;
width:80%;
padding: 15px;
font-size:15px;
`
const SearchIcon = styled(SearchRoundedIcon)`
color:#98c064;
font-size:30px;
margin-left:10px;
`
const NoGround = styled('div')`
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top:30px;
    p{
        margin: 10px;
    }
`
const SelectBox = styled('select')`
  height:40px;
  border:1px solid #888888;
  border-radius: 10px;
  padding:10px;
  display: inline-block;
  font-size:15px;
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    overflow-y: scroll;
  -moz-appearance:none;  /* Firefox */
  -webkit-appearance:none;  /* Safari and Chrome */
  appearance:none;  /* ????????? ????????? ??????*/
  ::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
    @media only screen and (max-width: 650px) {
    width:100%;
  }
}
  @media only screen and (max-width: 650px) {
    font-size:12px;
  }
  @media only screen and (max-width: 400px) {
    width:85%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
export const H2 = styled('h2')`
  @media only screen and (max-width: 650px) {
    display:none;
  }
`
const ButtonSelect = styled('div')`
    @media only screen and (min-width: 400px) {
        display:flex;
        justify-content: space-between;
  }
    margin-top:20px;
    /* display:'flex', justifyContent:'space-between', marginTop:'20px' */
`
const Topbutton = styled('div')`
    margin-right:30px;
    @media only screen and (max-width: 400px) {
        display:flex;
        justify-content: flex-end;
        margin-top:20px;
  }
`

export default function GroundList(){
    const router = useRouter();
    const [searchItem, setSearchItem] = useState('');
    // const {data:AllGround} = useQuery(['allGround'], getAllGround) //???????????? ????????? ?????????
    const [groundList, setGroundList] = useState([])
    const [placeList, setPlaceList] = useRecoilState(groundPlaceList)
    useEffect(()=>{
        if(!localStorage.getItem('access-token')){
            alert("?????????????????????")
            router.push('/login')
        }else{
            getAllGround().then((res) => {
                setGroundList(res)})
        }
    }, [])
    // const [count, setCount] = useState(0); //????????? ??? ??????
    // const [currentpage, setCurrentpage] = useState(1); //???????????????
    // const [postPerPage] = useState(12); //???????????? ????????? ??????
    // const [indexOfLastPost, setIndexOfLastPost] = useState(0);
    // const [indexOfFirstPost, setIndexOfFirstPost] = useState(0);
    // const [currentPosts, setCurrentPosts] = useState([]);

    // useEffect(() => {
    //     setCount(AllGround?.length);
    //     setIndexOfLastPost(currentpage * postPerPage);
    //     setIndexOfFirstPost(indexOfLastPost - postPerPage);
    //     setCurrentPosts(AllGround?.slice(indexOfFirstPost, indexOfLastPost));
    //   }, [currentpage, indexOfFirstPost, indexOfLastPost, postPerPage]);
      
    //   const setPage = (e) => {
    //     setCurrentpage(e);
    //   };

    function Search(keyword){
        if(keyword === ''){
            getAllGround().then(
                (res) => setGroundList(res)
            )
        }else{
            const result = groundList.filter((ground) => {
                if(ground['title'].includes(keyword)){
                    return ground
                }})
            setGroundList(result)
            setSearchItem('')
        }
    }

    function Filter(key){
        if(key==="1"){
            let res = [...groundList];
            res.sort((a, b)=>{
                return b.groundId - a.groundId
            })
            setGroundList(res)
        }else if(key === "2"){
            let res = [...groundList];
            res.sort((a, b)=>{
                return b.likes - a.likes
            })
            setGroundList(res)
        }else if(key==="0"){
            getAllGround().then(
                (res) => setGroundList(res)
            )
        }
    }

    return(
        <ParentsDiv>
                <Head>
      <title>???????????? ???????????? | ??????-?????????</title>
    </Head>
            <BackTitle name={'???????????? ????????????'}/>
            <GroundTop>
            <H2>???????? ???????????? ????????????</H2>
            <p style={{fontSize:'15px'}}>???????????? ????????? ??????????????? ????????? ????????? ????</p>
            <div style={{display:'flex', alignContent:'center'}}>
            <Input placeholder='???????????? ????????????' value={searchItem} onChange={(e) => {setSearchItem(e.target.value)}} />
            <SearchIcon onClick={()=>{Search(searchItem)}} />
            </div>
            <ButtonSelect>
                <SelectBox onChange={(e)=>{Filter(e.target.value)}}>
                    <option value="0">?????? ??????</option>
                    <option value="1">???????????????</option>
                    <option value="2">????????????</option>
                </SelectBox>
                <Topbutton>
                    <ButtonFull dColor='#98c064' hColor='#65ace2' style={{marginRight:'5px', fontSize:'15px'}} onClick={() => {router.push(`ground/myground`)}}>?????? ????????????</ButtonFull>
                    <ButtonFull dColor='#65ace2' hColor='#98c064' style={{fontSize:'15px'}} onClick={() => {router.push(`ground/createground`)}}>???????????? ??????</ButtonFull>
                </Topbutton>
            </ButtonSelect>
            </GroundTop>
                { groundList?.length === 0 ? <NoGround>
                    <p style={{fontSize:'50px'}}>????</p>
                    <p style={{fontSize:'20px', fontWeight:'bold'}}>???!</p>
                    <p style={{fontSize:'15px'}}>??????????????? ???????????? ?????????!</p>
                    <p style={{fontSize:'15px'}}>?????? ???????????? ???????????????????</p>
                </NoGround>: 
                <Grid>
                {groundList?.map((item)=>(<GroundItem key={item.groundId} onClick={() => {
                        router.push(`ground/${item.groundId}`)
            }}>
                <GroundIcon>{item.icon}</GroundIcon>
                <GroundTitle>{item.title}</GroundTitle>
                <GroundPlaceLength>{item.count}?????? ??????</GroundPlaceLength>
                </GroundItem>))}</Grid>}
            
            {/* <Paigination page={currentpage} count={count} setPage={setPage} /> */}
            
        </ParentsDiv>
    )
}
