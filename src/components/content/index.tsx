import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

const Content: FC = () => {
  const [solBalance, setSolBalance] = useState<any>();
  const wallet = useAnchorWallet();
  const network = WalletAdapterNetwork.Devnet;
  const connection = new Connection(clusterApiUrl(network));
  const [splTokenAccounts, setSplTokenAccounts] = useState<any>();

  const getAccounts = async (MY_WALLET_ADDRESS: any) => {
    const parsedProgramAccounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // number of bytes
          },
          {
            memcmp: {
              offset: 32, // number of bytes
              bytes: MY_WALLET_ADDRESS, // base58 encoded string
            },
          },
        ],
      }
    );

    setSplTokenAccounts(
      parsedProgramAccounts.map((account, i) => {
        const accountInfo: any = account.account.data;
        return {
          accountToken: account.pubkey.toString(),
          tokenMint: accountInfo["parsed"]["info"]["mint"],
          balance: accountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"],
        };
      })
    );
  };

  useEffect(() => {
    if (!wallet?.publicKey) return;
    const SOL = connection.getAccountInfo(wallet.publicKey);
    SOL.then((res) => {
      if (!res) return;
      setSolBalance(res.lamports / LAMPORTS_PER_SOL);
      getAccounts(wallet.publicKey);
    });
  }, [wallet?.publicKey]);

  return (
    <div className='container'>
      <div className='wrapper'>
        <div style={{ textAlign: "center" }}>
          <WalletMultiButton className='box' />
        </div>
        {wallet?.publicKey && solBalance && (
          <>
            <div className='box cur-auto'>{solBalance} SOl</div>
            {!!splTokenAccounts?.length && (
              <>
                <div className='box cur-auto'>other tokens 👇</div>
                {splTokenAccounts.map((token: any, i: number) => (
                  <div className='box' key={i}>
                    Amount: {token.balance} <br /> Mint: {token.tokenMint}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Content;
