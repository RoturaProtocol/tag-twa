import React, {useState, useEffect} from 'react';
import {DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {stringToPath} from '@cosmjs/crypto';
import {StargateClient} from '@cosmjs/stargate';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Snackbar,
    Paper,
} from '@mui/material';
import {Language, ContentCopy, Visibility, VisibilityOff, VpnKey} from '@mui/icons-material';
import WebApp from '@twa-dev/sdk';
import {useNavigate} from 'react-router-dom';
import '../styles/CosmosWallet.css';
import TokenTransfer from './TokenTransfer';


const TURA_PREFIX = "tura";
const TURA_COIN_TYPE = "118";
const TURA_RPC_ENDPOINT = "https://rpc-beta1.turablockchain.com";
const TURA_COIN_IMAGE = "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mainnet-tura/utura.png";

interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    icon: React.ReactNode;
    image?: string;
    change?: string;
    usdValue?: string;
}

const CosmosWallet: React.FC = () => {
    const [wallet, setWallet] = useState<DirectSecp256k1HdWallet | null>(null);
    const [address, setAddress] = useState<string>('');
    const [balances, setBalances] = useState<TokenBalance[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showMnemonicDialog, setShowMnemonicDialog] = useState<boolean>(false);
    const [mnemonic, setMnemonic] = useState<string>('');
    const [showCopySnackbar, setShowCopySnackbar] = useState<boolean>(false);
    const [showFullAddress, setShowFullAddress] = useState<boolean>(false);
    const [showExportMnemonicDialog, setShowExportMnemonicDialog] = useState<boolean>(false);
    const navigate = useNavigate();
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);


    useEffect(() => {
        loadExistingWallet();
    }, []);

    useEffect(() => {
        if (address) {
            fetchBalances();
        }
    }, [address]);


    const loadExistingWallet = async () => {
        try {
            const storedMnemonic = await new Promise<string | null>((resolve, reject) => {
                WebApp.CloudStorage.getItem('tura_mnemonic', (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result as string | null);
                    }
                });
            });

            if (storedMnemonic) {
                await importWallet(storedMnemonic);
                setMnemonic(storedMnemonic);
            }
        } catch (error) {
            console.error('Error loading existing wallet:', error);
            WebApp.showAlert('Failed to load existing wallet. Please try again.');
        }
    };

    const generateWallet = async () => {
        setLoading(true);
        try {
            const newWallet = await DirectSecp256k1HdWallet.generate(
                12,
                {
                    prefix: TURA_PREFIX,
                    hdPaths: [stringToPath(`m/44'/${TURA_COIN_TYPE}'/0'/0/0`)],
                }
            );
            const [account] = await newWallet.getAccounts();
            setWallet(newWallet);
            setAddress(account.address);
            setMnemonic(newWallet.mnemonic);
            setShowMnemonicDialog(true);

            await new Promise<void>((resolve, reject) => {
                WebApp.CloudStorage.setItem('tura_mnemonic', newWallet.mnemonic, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error('Error generating wallet:', error);
            WebApp.showAlert('Failed to generate wallet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const importWallet = async (mnemonic: string) => {
        setLoading(true);
        try {
            const importedWallet = await DirectSecp256k1HdWallet.fromMnemonic(
                mnemonic,
                {
                    prefix: TURA_PREFIX,
                    hdPaths: [stringToPath(`m/44'/${TURA_COIN_TYPE}'/0'/0/0`)],
                }
            );
            const [account] = await importedWallet.getAccounts();
            setWallet(importedWallet);
            setAddress(account.address);

            await new Promise<void>((resolve, reject) => {
                WebApp.CloudStorage.setItem('tura_mnemonic', mnemonic, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error('Error importing wallet:', error);
            WebApp.showAlert('Failed to import wallet. Please check your mnemonic and try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async () => {
        try {
            const client = await StargateClient.connect(TURA_RPC_ENDPOINT);
            const balanceResponse = await client.getAllBalances(address);

            const turaBalance = balanceResponse.find(coin => coin.denom === 'utura');
            const tagsBalance = balanceResponse.find(coin => coin.denom === 'utags');

            setBalances([
                {
                    symbol: 'TURA',
                    name: 'Tura',
                    balance: turaBalance ? (parseFloat(turaBalance.amount) / 100000000).toFixed(6) : '0',
                    icon: <img src={TURA_COIN_IMAGE} alt="TURA" style={{width: 40, height: 40}}/>,
                    image: TURA_COIN_IMAGE,
                },
                {
                    symbol: 'TAGS',
                    name: 'Tura',
                    balance: tagsBalance ? (parseFloat(tagsBalance.amount) / 100000000).toFixed(0) : '0',
                    icon: <Language style={{color: 'gray'}}/>,
                },
            ]);
        } catch (error) {
            console.error('Error fetching balances:', error);
            WebApp.showAlert('Failed to fetch balances. Please try again later.');
        }
    };

    const handleImport = () => {
        navigate('/import-wallet');
    };

    const handleMnemonicDialogClose = () => {
        setShowMnemonicDialog(false);
    };

    const handleCopyMnemonic = () => {
        navigator.clipboard.writeText(mnemonic).then(() => {
            setShowCopySnackbar(true);
        });
    };

    const handleCloseSnackbar = () => {
        setShowCopySnackbar(false);
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(address).then(() => {
            setShowCopySnackbar(true);
        });
    };

    const maskAddress = (addr: string) => {
        if (addr.length > 12) {
            return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
        }
        return addr;
    };

    const toggleAddressVisibility = () => {
        setShowFullAddress(!showFullAddress);
    };

    const handleExportMnemonic = () => {
        setShowExportMnemonicDialog(true);
    };

    const handleExportMnemonicDialogClose = () => {
        setShowExportMnemonicDialog(false);
    };

    const handleTokenClick = (token: TokenBalance) => {
        setSelectedToken(token);
        setShowTransferDialog(true);
    };

    const handleCloseTransferDialog = () => {
        setShowTransferDialog(false);
        setSelectedToken(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (!wallet) {
        return (
            <Box className="wallet-creation-container">
                <Box className="wallet-creation-content">
                    <Typography variant="h5" gutterBottom>Welcome to Tura Wallet</Typography>
                    <Typography variant="body1" gutterBottom className="wallet-subtitle">
                        Create a new wallet or import an existing one to get started.
                    </Typography>
                    <Box className="wallet-buttons">
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={generateWallet}
                            className="wallet-button"
                        >
                            Create New Wallet
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={handleImport}
                            className="wallet-button"
                        >
                            Import Existing Wallet
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="wallet-container">
            <Paper className="wallet-address-container">
                <Typography variant="h6" gutterBottom color="lightyellow">Wallet Address</Typography>
                <Box className="wallet-address-content">
                    <Typography
                        variant="body1"
                        className="wallet-address"
                    >
                        {showFullAddress ? address : maskAddress(address)}
                    </Typography>
                    <Box>
                        <IconButton onClick={toggleAddressVisibility} size="small"
                                    className="address-visibility-button">
                            {showFullAddress ? <VisibilityOff/> : <Visibility/>}
                        </IconButton>
                        <IconButton onClick={handleCopyAddress} size="small" className="address-copy-button">
                            <ContentCopy/>
                        </IconButton>
                    </Box>
                </Box>
                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleExportMnemonic}
                        startIcon={<VpnKey/>}
                        className="export-mnemonic-button"
                    >
                        Export Mnemonic
                    </Button>
                </Box>
            </Paper>

            <Typography variant="h6" gutterBottom className="token-balances-title">Token Balances</Typography>
            <List>
                {balances.map((token, index) => (
                    <ListItem
                        key={index}
                        className="token-balance-item"
                        onClick={() => handleTokenClick(token)}
                        style={{cursor: 'pointer'}}
                    >
                        <ListItemIcon>
                            {token.image ? (
                                <img src={token.image} alt={token.symbol} style={{width: 50, height: 50}}/>
                            ) : (
                                token.icon
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body1">
                                    {token.symbol}
                                    {token.change && (
                                        <Typography component="span" variant="body2"
                                                    className={token.change.startsWith('-') ? 'negative-change' : 'positive-change'}>
                                            {token.change}
                                        </Typography>
                                    )}
                                </Typography>
                            }
                            secondary={token.name}
                        />
                        <Box className="token-balance-amount">
                            <Typography variant="body1">{token.balance}</Typography>
                            {token.usdValue && <Typography variant="body2">{token.usdValue}</Typography>}
                        </Box>
                    </ListItem>
                ))}
            </List>


            <Dialog
                open={showMnemonicDialog}
                onClose={handleMnemonicDialogClose}
                PaperProps={{
                    className: "mnemonic-dialog"
                }}
            >
                <DialogTitle>Save Your Mnemonic Phrase</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph className="mnemonic-instructions">
                        Your mnemonic phrase is the key to your wallet. Write it down and keep it in a safe place.
                        You'll need it to recover your wallet if you lose access.
                    </Typography>
                    <Box className="mnemonic-box">
                        <Typography variant="body2" component="pre" className="mnemonic-text">
                            {mnemonic}
                        </Typography>
                        <IconButton onClick={handleCopyMnemonic} size="small" className="mnemonic-copy-button">
                            <ContentCopy/>
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleMnemonicDialogClose} className="mnemonic-confirm-button">
                        I've Saved It
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showExportMnemonicDialog}
                onClose={handleExportMnemonicDialogClose}
                PaperProps={{
                    className: "mnemonic-dialog"
                }}
            >
                <DialogTitle>Your Mnemonic Phrase</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph className="mnemonic-instructions">
                        This is your mnemonic phrase. Keep it safe and never share it with anyone.
                    </Typography>
                    <Box className="mnemonic-box">
                        <Typography variant="body2" component="pre" className="mnemonic-text">
                            {mnemonic}
                        </Typography>
                        <IconButton onClick={handleCopyMnemonic} size="small" className="mnemonic-copy-button">
                            <ContentCopy/>
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleExportMnemonicDialogClose} className="mnemonic-confirm-button">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={showCopySnackbar}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                message="Copied to clipboard"
                ContentProps={{
                    className: "copy-snackbar"
                }}
            />
            {selectedToken && (
                <TokenTransfer
                    open={showTransferDialog}
                    onClose={handleCloseTransferDialog}
                    tokenSymbol={selectedToken.symbol}
                    address={address}
                    balance={selectedToken.balance}
                    mnemonic={mnemonic}
                />
            )}
        </Box>
    );
};

export default CosmosWallet;