import { useEffect, useState } from "react";
import { urlClient, LENS_HUB_CONTRACT_ADDRESS, queryRecommendedProfiles, queryExplorePublications,
} from "./queries";

import LENSHUB from "./lenshub";
import { ethers } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";


function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

  async function signIn() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  async function getRecommendedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }


  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();

    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }


  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }



  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      return url;
    }

    return "/default-avatar.png";
  };



  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%" backgroundColor="#0a192f">
         <Box display="flex" justifyContent="space-between" alignItems="center"
           width="65%" margin="auto" color="silver" padding="10px 0" >
           <Box>
       <Box fontFamily="Lobster"  fontSize="60px" 
       bgGradient='linear(to-l, #0ea5ea, #0bd1d1)'
       bgClip='text'
       > 
       Web3 BlockChain 
       </Box>
       <Box fontFamily="Lobster Two"  fontSize="30px" 
       bgGradient='linear(to-l,  #0bd1d1, #0ea5ea)'
       bgClip='text'> Social Media App</Box>
      </Box>
          {account ? (
            <Button backgroundColor="#0ea5ea" 
            bgGradient='linear(to-l, #0ea5ea, #0bd1d1)'
            color="#172a45" 
            fontFamily="Lobster Two"  fontSize="25px" 
            _hover={{ backgroundColor: "#0ea5ea" }}>
              Connected
            </Button>
          ) : (
            <Button onClick={signIn} 
            bgGradient='linear(to-l, #0ea5ea, #0bd1d1)'
            color="#172a45" fontFamily="Lobster Two" 
             fontSize="25px"
              _hover={{ backgroundColor: "#0ea5ea"}} >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box display="flex" justifyContent="space-between" width="65%" margin="35px auto auto auto"
          color="silver" >

        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box key={post.id} marginBottom="25px" backgroundColor="#0a192f" padding="40px 30px 40px 25px"
              borderRadius="10px">
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img alt="profile" src={parseImageUrl(post.profile)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px" >
                  <Box display="flex" justifyContent="space-between" >
                    <Box fontFamily="maven pro" fontSize="35px" 
                    bgGradient='linear(to-l, #0ea5ea, #0bd1d1)'
                    bgClip='text'
                    >
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.id)}
    
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="16px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box width="30%" backgroundColor="#0a192f" padding="40px 25px" borderRadius="10px" height="fit-content"
          fontSize="20px">
          <Box fontFamily="Lobster Two" fontSize="30px"
          bgGradient='linear(to-l, #0ea5ea, #0bd1d1)'
          bgClip='text'
          >Friend Suggestions</Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#0ea5ea", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
