import requests
import json
from typing import Dict, Any

def call_openai(prompt: str, api_key: str) -> str:
    """
    Call OpenAI's GPT-4 model to generate a response.
    
    Args:
        prompt (str): The input prompt to send to the model
        api_key (str): OpenAI API key for authentication
        
    Returns:
        str: Generated response text or error message
    """
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error calling OpenAI: {str(e)}"

def call_gemini(prompt: str, api_key: str) -> str:
    """
    Call Google's Gemini Pro model to generate a response.
    
    Args:
        prompt (str): The input prompt to send to the model
        api_key (str): Google API key for authentication
        
    Returns:
        str: Generated response text or error message
    """
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"Error calling Gemini: {str(e)}"

def call_claude(prompt: str, api_key: str) -> str:
    """
    Call Anthropic's Claude 3 model to generate a response.
    
    Args:
        prompt (str): The input prompt to send to the model
        api_key (str): Anthropic API key for authentication
        
    Returns:
        str: Generated response text or error message
    """
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    data = {
        "model": "claude-3-opus-20240229",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["content"][0]["text"]
    except Exception as e:
        return f"Error calling Claude: {str(e)}"

def call_perplexity(prompt: str, api_key: str) -> str:
    """
    Call Perplexity's model to generate a response with real-time web search.
    
    Args:
        prompt (str): The input prompt to send to the model
        api_key (str): Perplexity API key for authentication
        
    Returns:
        str: Generated response text or error message
    """
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "pplx-7b-online",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error calling Perplexity: {str(e)}" 