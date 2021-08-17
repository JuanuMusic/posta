const MAINNET_UBI_ADDRESS = "0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4";
const MAINNET_POH_ADDRESS = "0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb";
const MAINNET_POSTA_ADDRESS = "0xae199eb85a303d11725d193efd1e6ab312a980b6";

const KOVAN_UBI_ADDRESS = "0xDdAdE19B13833d1bF52c1fe1352d41A8DD9fE8C9";
const KOVAN_POH_ADDRESS = "0x73BCCE92806BCe146102C44c4D9c3b9b9D745794";
const KOVAN_POSTA_ADDRESS = "0x0C5E8C6F974D2E2Ac8FF59b12d61b85E0bdfcC8b";

const LOCAL_UBI_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_POH_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const LOCAL_POSTA_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"


export function getContractsByNetwork(network: string): { poh: string, ubi: string, posta: string } {
    switch (network) {
      case "develop":
        return { poh: LOCAL_POH_ADDRESS, ubi: LOCAL_UBI_ADDRESS, posta: LOCAL_POSTA_ADDRESS };
      case "kovan":
        return { poh: KOVAN_POH_ADDRESS, ubi: KOVAN_UBI_ADDRESS, posta: KOVAN_POSTA_ADDRESS };
      case "mainnet":
        return { poh: MAINNET_POH_ADDRESS, ubi: MAINNET_UBI_ADDRESS, posta: MAINNET_POSTA_ADDRESS };
      default: throw new Error(`Invalid network: ${network}`);
  
    }
  }