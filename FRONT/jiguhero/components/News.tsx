import NewsItem from 'components/NewsItem';

const NewsObj = [
    {
        id:1,
        category:'프로모션',
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-WhG2avREW73GgXw_mpEO8TrN9mkgfAmopg&usqp=CAU',
        title:'친환경 에코라인 출시'
    },
    {
        id:2,
        category:'이벤트',
        image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9RMzbFEVX3gMZrjRD5l3A8L8t--MhD-cfvA&usqp=CAU',
        title:'텀블러 가져오면 커피를 무료로!'
    },
    {
        id:3,
        category:'프로모션',
        image:'data:image/jpeg;base64,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',
        title:'지구의 날 기념 리사이클링 브랜드 누깍 할인'
    }
]

export default function News(){
    return(
        <>
        {NewsObj.map((item) => (<NewsItem {...item} />))}
        </>
    )
}