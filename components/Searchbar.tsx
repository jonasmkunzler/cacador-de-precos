"use client"

import { scrapeAndStoreProduct } from '@/lib/actions';
import { Source } from '@/types';
import { FormEvent, useState } from 'react'

const validSouceFromURL = (url:string):Source => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(
      hostname.includes('terabyteshop.com.br') || 
      hostname.includes('terabyteshop.') || 
      hostname.endsWith('terabyteshop')
    ) {
      return 'Terabyte';
    }

    if(
      hostname.includes('kabum.com.br') || 
      hostname.includes('kabum.') || 
      hostname.endsWith('kabum')
    ) {
      return 'Kabum';
    }

    if(
      hostname.includes('pichau.com.br') || 
      hostname.includes('pichau.') || 
      hostname.endsWith('pichau')
    ) {
      return 'Pichau';
    }

    if(
      hostname.includes('amazon.com.br')
    ) {
      return 'Amazon';
    }

  } catch (error) {
    return 'Unknown';
  }
  return 'Unknown';
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidSource:Source = validSouceFromURL(searchPrompt);
    console.log(isValidSource);

    if(isValidSource == 'Unknown') {
      setSearchPrompt('')
      return alert('Por favor coloque uma URL válida, estamos trabalhando apenas com:   KABUM | AMAZON BR | TERABYTE | PICHAU')
    }

    try {
      setIsLoading(true);

      // Scrape the product page
      const product = await scrapeAndStoreProduct(searchPrompt, isValidSource);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClean = () => {
    setSearchPrompt("");
  }

  return (
    <form 
      className="flex flex-wrap gap-4 mt-12 pb-2" 
      onSubmit={handleSubmit}
    >
      <button
      onClick={handleClean}
      className='searchbar-btn'
      disabled={searchPrompt === ''}>
        Limpar
      </button>
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Cole aqui a URL do seu produto"
        className="searchbar-input"
      />

      <button 
        type="submit" 
        className="searchbar-btn"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Adicionando...' : 'Adicionar'}
      </button>
    </form>
  )
}

export default Searchbar