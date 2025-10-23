import os
import sys
import time
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get session ID from environment variable
INSTAGRAM_SESSION = os.getenv('INSTAGRAM_SESSION_ID')
if not INSTAGRAM_SESSION:
    print("Error: INSTAGRAM_SESSION_ID not found in .env file")
    print("Please create a .env file with your Instagram session ID")
    print("Example:\nINSTAGRAM_SESSION_ID=your_session_id_here")
    sys.exit(1)

# Open file in append mode to store user IDs
try:
    fff = open("idsUser.txt", "a")
except Exception as e:
    print(f"Error opening file: {e}")
    sys.exit(1)

# Instagram API request configuration
cookies = {
    'ig_nrcb': '1',
    'mid': 'Ytp9sgABAAEr3s0_2YZo4_XrBDmF',
    'ig_did': 'EF3EF3F3-2BFA-4468-82AE-4A63DE12C163',
    'csrftoken': 'h9vf5RqN4Yl9idwz90th4sl3mZ0duupl',
    'ds_user_id': '50549400865',
    'sessionid': INSTAGRAM_SESSION,
    'shbid': '"19028\\05450549400865\\0541690022225:01f7463b7479e4cb68363b580320b2bd34f4bf58e0b2e7db477f59a721791a3065424fff"',
    'shbts': '"1658486225\\05450549400865\\0541690022225:01f7330e75353242a634c9bc68bf92a871d6bba2948440863ef591941020a09293bb99e3"',
    'dpr': '3',
    'datr': '4n3aYn-bhY8KT8xSZYSIfl3l',
    'rur': '"RVA\\05450549400865\\0541690022392:01f7eec25e9967bf344a1198e0bc0adbd4f74c36dd1cfdf912a828ea5ca2db8cc3086ef6"',
}

headers = {
    'authority': 'i.instagram.com',
    'accept': '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'origin': 'https://www.instagram.com',
    'referer': 'https://www.instagram.com/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 9; RMX1831) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.40 Mobile Safari/537.36',
    'viewport-width': '360',
    'x-asbd-id': '198387',
    'x-csrftoken': 'h9vf5RqN4Yl9idwz90th4sl3mZ0duupl',
    'x-ig-app-id': '1217981644879628',
    'x-ig-www-claim': 'hmac.AR1lFVsHGZeq1W-0kNXZNAjWgdDUsZrElLKDrKDvHk1WZ7-E',
}

# Initialize variables
kolo = ''  # For pagination
count = 1   # Counter for tracking
k = 0       # Index counter

def run():
    global kolo, count, k
    try:
        params = {
            'count': '20942',
            'max_id': kolo,
            'search_surface': 'follow_list_page',
        }

        # Make API request to get followers
        response = requests.get(
            'https://i.instagram.com/api/v1/friendships/44193286312/followers/',
            params=params,
            cookies=cookies,
            headers=headers
        ).json()
        
        k = 0
        kolo = response.get('next_max_id', '')  # Safely get next_max_id or empty string

        # Process each user in the response
        for user in response.get('users', []):
            userid = user.get('pk')
            username = user.get('username')
            print(f'{userid}  :  {username} ')
            
            # Write user ID to file
            if userid:
                fff.write(f"{userid}\n")
            
            k += 1

    except Exception as e:
        print(f"An error occurred: {e}")
    
    # Wait before next request to avoid rate limiting
    time.sleep(60)
        
# Main loop
if __name__ == "__main__":
    print("Starting Instagram Follower Scraper...")
    print("Press Ctrl+C to stop the script\n")
    
    try:
        while True:
            run()
    except KeyboardInterrupt:
        print("\nScript stopped by user")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
    finally:
        fff.close()
        print("File has been closed.")
        print(f"Total users scraped: {count}")
