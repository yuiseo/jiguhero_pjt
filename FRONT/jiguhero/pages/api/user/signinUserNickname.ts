import { BASE_URL } from "pages/api/fetch";



export default async function signinUserNickname(nickname, userId) {
	const t = localStorage.getItem("access-token");
	let token;
	if (t.includes('"')){
	  const res = t.substring(1, t.length - 1);
	  token = `Bearer ${res}`
	}else{
	  token = `Bearer ${localStorage.getItem('access-token')}`
	}
	// const token = t.substring(1, t.length - 1);
	// const Token = `Bearer ${localStorage.getItem('access-token')}`
  
	const response = await fetch(`${BASE_URL}user/${userId}?nickname=${nickname}`,
	{
		method: "PUT",
		headers: new Headers({
			Authorization: token,
		}),
		
	})

	const data = await response.json()

	console.log(data)
	return data
}