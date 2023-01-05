import React, { useEffect, useState } from "react";
import axios from 'axios';
import './Home.css';
import { Link } from "react-router-dom";
const Home = ({buyProduct}) => {
    const [products, setProducs] = useState([]);
    const [category, setCategory] = useState([]);
    const [status, setStatus] = useState('all');
    useEffect(()=>{
axios('https://fakestoreapi.com/products')
.then(({data})=>{
setProducs(data)
});
axios('https://fakestoreapi.com/products/categories')
.then(({data})=>{
    setCategory(data)
});
    }, []);
    return (
        <section>
            <div className="category">
                {
                    category.length === 0 ? <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>:
                    <><button className={status === 'all' ? 'category-btn active' : 'category-btn'} onClick={()=>{
                        setProducs([]);
                        axios('https://fakestoreapi.com/products')
    
                        .then(({data})=>{
                        setProducs(data)
                        });
                        setStatus('all')
                    }}>all</button>
                    {
                        category.map((item)=>{
                            return <button className={status === item ? 'category-btn active' : 'category-btn'} onClick={()=>{
                                setProducs([]);
                                axios(`https://fakestoreapi.com/products/category/${item}`)
                                .then(({data})=>{
                                    setProducs(data)
                                });
                                setStatus(item)
                            }}>{item}</button>
    
                        })
                        
                    }</>
                }
                
            </div>
            <div className={"container"}>
                <div className="row">
                   
                    {
                         products.length === 0 ? <div className="preloader">
                         <div class="lds-ring">
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                               </div>
                             </div>:
                       products.map((item)=>{
                           return <div className={"col-4"}>
                           
                               <div className="card">
                                   <img className={'card-img'} src={item.image} alt=""/>
                                   <h4>{item.title.length > 10 ? item.title.substr(0, 10)+'...' : item.title}</h4>
                                   <p>{item.description.length > 60 ? item.description.substr(0, 60) + '' : item.description}</p>
                                   <h3>${item.price}</h3>
                                <div className="card__buttons">
                                    <Link to={`/product/${item.id}`}>more</Link>
                                    <button onClick={()=>{
                                        buyProduct(item)
                                     }}>buy</button>
                                </div>
                               </div>
                               </div>
                       })
                    }
                </div>
            </div>
        </section>
    );
};
export default Home;