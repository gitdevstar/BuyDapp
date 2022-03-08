import * as React from "react";

import { Container, Row, Col, Accordion, Card, Form, InputGroup, Button } from 'react-bootstrap';

// import Select from 'react-select';

import Web3 from "web3";
// @ts-ignore
import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnect from "@walletconnect/web3-provider";
// @ts-ignore
import Torus from "@toruslabs/torus-embed";
// @ts-ignore
import WalletLink from "walletlink";

import CreditCardInput from 'react-credit-card-input';

import Header from "./components/WalletHeader";
import ConnectButton from "./components/ConnectButton";

import {
    getChainData
} from "../helpers/utilities";

import Api from '../Api';

const INITIAL_STATE = {
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    assets: [],
    showModal: false,
    pendingRequest: false,
    result: null
};

function initWeb3(provider) {
    const web3 = new Web3(provider);

    web3.eth.extend({
        methods: [
            {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: web3.utils.hexToNumber
            }
        ]
    });

    return web3;
}

class App extends React.Component {
    // @ts-ignore

    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE,
            validated: false,
            payment: true
        };

        this.web3Modal = new Web3Modal({
            network: this.getNetwork(),
            cacheProvider: true,
            providerOptions: this.getProviderOptions()
        });
    }

    componentDidMount() {
        if (this.web3Modal.cachedProvider) {
            this.onConnect();
        }
    }

    handleCheckout = (e) => {
        const form = e.currentTarget
        const {
            coin,
            amount,
            paypal,
            cardNumber,
            expiry,
            cvc,
        } = form;

        e.preventDefault();

        if (form.checkValidity() === false) {
            e.stopPropagation();
            this.setState({validated: true});
        }

        if (paypal.value === '' && cardNumber.value === '' && expiry.value === '' && cvc.value === '') {
            this.setState({payment: false});
            return;
        } else {
            this.setState({payment: true});
        }

        if (form.checkValidity() === false) return;

        const data = {
            'coin': coin.value,
            'amount': amount.value,
            'paypal': paypal.value,
            'cardNumber': cardNumber.value,
            'expiry': expiry.value,
            'cvc': cvc.value,
            'address': this.state.address
        }

        console.log('data', data);
        Api.apiFetch('/checkout', data)
        .then(data => {
            alert('sent');
        })
        .catch(error => {
            console.log(error);
        });

    }

    onConnect = async () => {
        const provider = await this.web3Modal.connect();

        await this.subscribeProvider(provider);

        await provider.enable();
        const web3 = initWeb3(provider);

        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.chainId();

        await this.setState({
            web3,
            provider,
            connected: true,
            address,
            chainId,
            networkId
        });
    };

    subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts) => {
            await this.setState({ address: accounts[0] });
            await this.getAccountAssets();
        });
        provider.on("chainChanged", async (chainId) => {
            const { web3 } = this.state;
            const networkId = await web3.eth.net.getId();
            await this.setState({ chainId, networkId });
            await this.getAccountAssets();
        });

        provider.on("networkChanged", async (networkId) => {
            const { web3 } = this.state;
            const chainId = await web3.eth.chainId();
            await this.setState({ chainId, networkId });
            await this.getAccountAssets();
        });
    };

    getNetwork = () => getChainData(this.state.chainId).network;

    getProviderOptions = () => {
        const infuraId = process.env.REACT_APP_INFURA_ID;
        console.log("infuraId", infuraId);
        const providerOptions = {
            walletconnect: {
                package: WalletConnect,
                options: {
                    infuraId
                }
            },
            torus: {
                package: Torus
            },
            walletlink: {
                package: WalletLink,
                options: {
                    appName: "Web3Modal Example App",
                    infuraId
                }
            }
        };
        return providerOptions;
    };

    resetApp = async () => {
        const { web3 } = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.web3Modal.clearCachedProvider();
        this.setState({ ...INITIAL_STATE });
    };

    render = () => {
        const {
            address,
            connected,
            chainId,
            validated,
            payment
        } = this.state;

        return (
            <Container>
                <Header
                    connected={connected}
                    address={address}
                    chainId={chainId}
                    killSession={this.resetApp}
                />
                <Row className="justify-content-md-center">
                    <Col xs md="8" lg="4">
                        <Row className="justify-content-center">
                            <ConnectButton onClick={this.onConnect} />
                        </Row>
                        <Card>
                            <Card.Body>
                                <Form method="POST" noValidate validated={validated} onSubmit={this.handleCheckout}>
                                    <Form.Group>
                                        <Form.Label>Select A Coin</Form.Label>
                                        <Form.Select name="coin">
                                            <option value="eth">ETH</option>
                                            <option value="usdc">USDC</option>
                                            <option value="usdt">USDT</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group style={{ marginTop: 30 }}>
                                        <Form.Label>Input Amount</Form.Label>
                                        <InputGroup hasValidation>
                                            <InputGroup.Text id="inputGroupPrepend">$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                aria-describedby="inputGroupPrepend"
                                                required
                                                name="amount"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please input amount.
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>

                                    <Accordion defaultActiveKey={0} style={{ marginTop: 30 }}>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Credit Card</Accordion.Header>
                                            <Accordion.Body>
                                                <CreditCardInput
                                                    cardNumberInputProps={{ name: 'cardNumber' }}
                                                    cardExpiryInputProps={{ name: 'expiry'}}
                                                    cardCVCInputProps={{ name: 'cvc'}}
                                                    fieldClassName="input"
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Paypal</Accordion.Header>
                                            <Accordion.Body>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <InputGroup.Text id="inputGroupPrepend1">@</InputGroup.Text>
                                                        <Form.Control
                                                            type="email"
                                                            aria-describedby="inputGroupPrepend1"
                                                            name="paypal"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                    {
                                        (!payment) && 
                                            <span style={{color: '#dc3545'}}>Please select payment method.</span>
                                    }
                                    <Row>
                                        <Button variant="danger" type="submit" size="lg" style={{ marginTop: 30 }}>Checkout</Button>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    };
}

export default App;
