// src/App.jsx

import { useState } from 'react';
import { ethers } from 'ethers';
import { Form, Button, Card, Image } from 'react-bootstrap';
import PriceConsumerV3 from './artifacts/contracts/PriceConsumerV3.sol/PriceConsumerV3.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [storedPrice, setStoredPrice] = useState('');
  const [item, setItem] = useState({ pairs: '' });

  const { pairs } = item;

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  

  async function updatePrice(feedId) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, PriceConsumerV3.abi, signer);
        console.log(contract);

        try {
          console.log("Updating price for feedId", feedId);
          await contract.updatePrice(feedId);
        } catch (err) {
          console.log('Error updating price: ', err);
        }
      } catch (err) {
        console.log('Error requesting account: ', err);
      }
    }
  }

  async function fetchPrice(feedId) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, PriceConsumerV3.abi, provider);
  
        console.log("Fetching price for feedId", feedId);
        const price = await contract.getLastFetchedPrice(feedId);
        console.log("Price", price);
        setStoredPrice(price.toString());
      } catch (err) {
        console.log('Error fetching price: ', err);
      }
    }
  }
  

  const handleChange = (e) => {
    let feedId;
    console.log(e.target.value);
    switch (e.target.value) {
      
      case 'BTC/USD':
        feedId = 1;
        break;
      case 'ETH/USD':
        feedId = 2;
        break;
      case 'LINK/USD':
        feedId = 3;
        break;
      case 'BTC/ETH':
        feedId = 4;
        break;
      default:
        feedId = 0;
    }
    setStoredPrice('');
    console.log("FeedID", feedId);
    setItem({
      ...item,
      pairs: e.target.value,
      feedId: feedId, 
    });    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Fetch Price", item.feedId);
    await updatePrice(item.feedId);
    fetchPrice(item.feedId);
  };

  function formatStoredPrice(pair, price) {
    switch (pair) {
      case 'BTC/USD':
        return insertDecimal(price, 5);
      case 'ETH/USD':
        return insertDecimal(price, 4);
      case 'LINK/USD':
        return insertDecimal(price, 2);
      case 'BTC/ETH':
        return insertDecimal(price, 2);
      default:
        return price;
    }
  }
  
  function insertDecimal(price, decimalPosition) {
    const integerPart = price.substring(0, decimalPosition);
    const decimalPart = price.substring(decimalPosition);
    return parseFloat(integerPart + '.' + decimalPart).toFixed(2);
  }
  

  return (
    <div className='container'>
      <Image
        src='https://seeklogo.com/images/C/chainlink-logo-B072B6B9FE-seeklogo.com.png'
        width={200}
        height={200}
        fluid
        className='mt-5'
      />
      <div>
        <Card style={{ width: '32rem' }} className='mt-5 shadow bg-body rounded'>
          <Card.Header as='h5'>Conversion Pair</Card.Header>
          <Card.Body>
            <div className='col'>
              <form onSubmit={handleSubmit}>
                <Form.Group controlId='pairs'>
                  <Form.Check
                    value='BTC/USD'
                    type='radio'
                    aria-label='radio 1'
                    label='BTC/USD'
                    onChange={handleChange}
                    checked={pairs === 'BTC/USD'}
                  />
                  <Form.Check
                    value='ETH/USD'
                    type='radio'
                    aria-label='radio 2'
                    label='ETH/USD'
                    onChange={handleChange}
                    checked={pairs === 'ETH/USD'}
                  />
                  <Form.Check
                    value='LINK/USD'
                    type='radio'
                    aria-label='radio 3'
                    label='LINK/USD'
                    onChange={handleChange}
                    checked={pairs === 'LINK/USD'}
                  />
                  <Form.Check
                    value='BTC/ETH'
                    type='radio'
                    aria-label='radio 4'
                    label='BTC/ETH'
                    onChange={handleChange}
                    checked={pairs === 'BTC/ETH'}
                  />
                </Form.Group>
                <div className='mt-5'>
                  <Button variant='outline-primary' size='5m' type='submit'>
                    Get Answer From The Price Oracle
                  </Button>
                </div>
              </form>
            </div>
          </Card.Body>
          <Card>
            <Card style={{ width: '32rem' }} className='mt-5 shadow bg-body rounded'>
              <Card.Header as='h5'>Answer</Card.Header>
              <Card.Body>
              <div className='col'>
              <h5>
                {pairs} --&gt; ${formatStoredPrice(pairs, storedPrice)}
              </h5>
              </div>
              </Card.Body>
            </Card>
          </Card>
        </Card>
      </div>
    </div>
  );
}

export default App;
