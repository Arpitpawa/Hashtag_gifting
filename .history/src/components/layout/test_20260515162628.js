setTimeout(() => {
  console.log('log of setTimeout');
}, 0);
 
console.log('line 7');
 
Promise.resolve().then(() => {
  console.log('log of promise');
});
 
// 1, , 7 ,  9  , 3
 
//Promise.all
 
const promise1 = Promise.resolve('fulfilled promise 1');
const promise2 = Promise.reject('failed second promise');
const promise3 = Promise.resolve('fulfilled third promise');
 
console.log(promise1);
//draw if one promise failed all got rejected;
Promise.all([promise1, promise2, promise3])
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
 
Promise.allSettled([promise1, promise2, promise3])
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
 
const post = fetch('https://jsonplaceholder.typicode.com/posts').then((res) =>
  res.json()
);
const comments = fetch('https://jsonplaceholder.typicode.com/comments').then(
  (res) => res.json()
);
const photos = fetch('https://jsonplaceholder.typicode.com/photos').then(
  (res) => res.json()
);
Promise.all([post , comments, photos]).then((data)=>{
    console.log(data)
});