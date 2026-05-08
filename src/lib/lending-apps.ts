export interface LendingApp {
  id: string;
  name: string;
  iconUrl: string | null;
  category: "lending" | "bnpl" | "bank" | "ewallet";
  playStoreId?: string;
}

export const LENDING_APPS: LendingApp[] = [
  // --- Lending Apps ---
  {
    id: "Tala",
    name: "Tala",
    iconUrl: "https://play-lh.googleusercontent.com/WXSzDV_Myt61m-4KrgtqAEOdw4nluHhgusjxYFEsDR32H0url7MnVPfWvQ1k5bsDy5sL=w240-h480",
    category: "lending",
    playStoreId: "ph.com.tala",
  },
  {
    id: "Cashalo",
    name: "Cashalo",
    iconUrl: "https://play-lh.googleusercontent.com/ogCW2waQzgvaa5dH1oEa0JFg2jWtE5HMmTKCL94BnnxIHg81RcvZp0OHNOsldyLOLVo=w240-h480",
    category: "lending",
    playStoreId: "com.oriente.cashalo",
  },
  {
    id: "HomeCredit",
    name: "Home Credit",
    iconUrl: "https://play-lh.googleusercontent.com/6gzwfm7SWwLIgcljG4JcFk9zbDVjA6gy0tsEDSyK5dCMinb9qYgunJlWCbi7D6ld1WQ=w240-h480",
    category: "lending",
    playStoreId: "ph.homecredit.capp",
  },
  {
    id: "JuanHand",
    name: "JuanHand",
    iconUrl: "https://play-lh.googleusercontent.com/vDXqGlNOfH_TwZH_7P9I6lW2rPR9_vJd2NYgI_XTjlgrW1j0DM9R_QpDEpRtF5I3cbNf=w240-h480",
    category: "lending",
    playStoreId: "com.juanhand.fast.cash.peso.loan.app",
  },
  {
    id: "Digido",
    name: "Digido",
    iconUrl: "https://play-lh.googleusercontent.com/r6Da91PGQ3ncubSXYGF30wIPqU2CzDcsOXOKVnsVhQ8q6SBI2kIsh_TIN1rme4C-cPs=w240-h480",
    category: "lending",
    playStoreId: "ph.loans.mobile",
  },
  {
    id: "MoneyCat",
    name: "MoneyCat",
    iconUrl: "https://play-lh.googleusercontent.com/3Krz51bMFk_Sa9kiD7vaR_POmetVB-vaXatk1TJHn1AKxeJlDY5SYUAZZdHAoPxt7YbPgSaMpxjEZ59TD8R22Q=w240-h480",
    category: "lending",
    playStoreId: "ph.prestapro",
  },
  {
    id: "Mocasa",
    name: "Mocasa",
    iconUrl: "https://play-lh.googleusercontent.com/LQV793sfZL9ctTfKSrm8WEMaNINVgh-yhWq79nlxXXq4KQY_n1jZwqxmVOJM9vqRp7ldpobS0aVBvuOSMCdHfQ=w240-h480",
    category: "lending",
    playStoreId: "com.mocasa.ph",
  },
  {
    id: "MocaMoca",
    name: "MocaMoca",
    iconUrl: "https://play-lh.googleusercontent.com/Qo2-mjRRdBTZQBjT7WkiYEpDQoYd8xhcMOfWbxeGuYdCpECIn0KWZbdPWwG2K67hqm-p=w240-h480",
    category: "lending",
    playStoreId: "com.mocamoca",
  },
  {
    id: "Fidoph",
    name: "Fidoph",
    iconUrl: "https://play-lh.googleusercontent.com/AxN8MeaODLlof-3KKZxdJTgnwLWHLIStXJLmBzncNd7p8snjbMztPKz8DJwsNjxifA2d=w240-h480",
    category: "lending",
    playStoreId: "ph.fido.fidoph",
  },
  {
    id: "Salmon",
    name: "Salmon",
    iconUrl: "https://play-lh.googleusercontent.com/l0CQqDj6BMX2hFgbnRILtKe11BSAiB7Ki_X3OSYK0eWypjnQ8lk6z_XKEhWJYu0yUuE=w240-h480",
    category: "lending",
    playStoreId: "com.fhl.salmon",
  },
  {
    id: "OnlineLoans",
    name: "Online Loans Pilipinas",
    iconUrl: "https://play-lh.googleusercontent.com/-z1ecZViLFqx_Z-lEveJrkQuD4ykgAy3xGZkoK3wBl9zioZmvyLuGqQ_RJnLXn1lIQ=w240-h480",
    category: "lending",
    playStoreId: "ph.onlineloans.mobile.android",
  },
  {
    id: "FTLending",
    name: "FT Lending",
    iconUrl: "https://play-lh.googleusercontent.com/EeJcP24xMo7D2EMt6a_dovydG7o3dv1J9H2RwiXdZJRkZg4VWmz9QqoqUVc2Meo5tOuR=w240-h480",
    category: "lending",
    playStoreId: "com.ftlending.fast.cash.loan",
  },
  {
    id: "MabilisCash",
    name: "MabilisCash",
    iconUrl: "https://play-lh.googleusercontent.com/rWDEBMf-mN_-jZYIBcO9gu2lkXzyjMi2OOiVI1bFgXYKygOX3jQWUepRTn2ZImhcEuo=w240-h480",
    category: "lending",
    playStoreId: "com.loans.lending.onlinelend.mabiliscash",
  },
  {
    id: "Kviku",
    name: "Kviku",
    iconUrl: "https://play-lh.googleusercontent.com/m-w54qKn9gXAbZzC1v3gDTYTAX1QCHdKdE-VtWpk8-fMLbfbbNJ6Vt888Pq9NJShnB4=w240-h480",
    category: "lending",
    playStoreId: "com.kviku.ph.mobile",
  },
  {
    id: "PesoCash",
    name: "PesoCash",
    iconUrl: "https://play-lh.googleusercontent.com/SxqqKDeDhFtb-5bFrqO6RAADRUPSXf2BEoaHcvmdEubd-1tsEnqq-J2jqwmzdl8--zY=w240-h480",
    category: "lending",
    playStoreId: "com.myloan.pesocash",
  },
  {
    id: "Akulaku",
    name: "Akulaku",
    iconUrl: "https://play-lh.googleusercontent.com/4HnPDVIe2Rqv1Eyrmgf7A-Aj-fe3xD-6pRO2B5R4GtJd1oh2eqSJognbhx_HyU1Xb56-e635w9KZtTXsUc0=w240-h480",
    category: "lending",
    playStoreId: "com.akulaku.ph.installment",
  },
  {
    id: "Pesoloan",
    name: "Pesoloan",
    iconUrl: "https://play-lh.googleusercontent.com/nzOb1oFCyIHQ5_zu634THu_e64fkgJreLryWj4caGFcvegG7kHs3I2LDg79XR2weJ_eH=w240-h480",
    category: "lending",
    playStoreId: "ph.com.peso.fast.loan.android",
  },
  {
    id: "CashExpress",
    name: "Cash Express",
    iconUrl: "https://play-lh.googleusercontent.com/irb4MK7i2g8gcUeq-tSLBrfi-7v0SvujyQoxQqQMZMbLCtPgveBmI3zW5fgJV8rEFWM=w240-h480",
    category: "lending",
    playStoreId: "com.allfinancetool.one",
  },
  {
    id: "PinoyPeso",
    name: "Pinoy Peso",
    iconUrl: "https://play-lh.googleusercontent.com/aAxG5qAeE0AZWw2XTzp27ktttGLO3wo82pngLB-HmDB-gA7rw-GeFmt9YV_cKOOkt5Va8gxq9DMOF9bZYMlO=w240-h480",
    category: "lending",
    playStoreId: "com.ph.pinoy.peso",
  },
  {
    id: "PesoRedee",
    name: "PesoRedee",
    iconUrl: "https://play-lh.googleusercontent.com/NB2FBXu0YTEbO1M0SQTkCvBIrLPul2TTJIbpniFDQg2rrK96EPJvFnedd4WMIWaqzxs=w240-h480",
    category: "lending",
    playStoreId: "ph.pesoredee.mobile.android",
  },
  {
    id: "CashBee",
    name: "CashBee",
    iconUrl: "https://play-lh.googleusercontent.com/ta2tpS5JVvtHJqWXDeczbbbe0Qqoyz9vRU85YwdvDbqR8uP47xl9z9wLlAhYeOQqRVvp=w240-h480",
    category: "lending",
    playStoreId: "org.cashbee.quasar.app",
  },
  {
    id: "Finami",
    name: "Finami",
    iconUrl: "https://play-lh.googleusercontent.com/Me3pmxZLqnV892cvRIlAL158eG_h9EJvYY69gGFtYQetCQuJInIBoscVScOTelnBWC-P=w240-h480",
    category: "lending",
    playStoreId: "com.decode9.finamiapp",
  },
  {
    id: "PawnHero",
    name: "PawnHero",
    iconUrl: "https://play-lh.googleusercontent.com/GIF_RjAMZ4LLjiULx0WlJFJi3teWl2nCyRLdfahyDHb2a2R6iE8ds13yQjcXe-DHH24=w240-h480",
    category: "lending",
    playStoreId: "com.pawnhero.mobileapp",
  },
  {
    id: "SBFinance",
    name: "SB Finance",
    iconUrl: "https://play-lh.googleusercontent.com/eC1vtUTUz4H-CZb01yA60o1iDJIZuTUlZP_MtEwfocdD77VeomzW6zpYOs1VnXSHmlU=w240-h480",
    category: "lending",
    playStoreId: "com.iw.sbfinancial",
  },
  {
    id: "CashMart",
    name: "CashMart",
    iconUrl: "https://play-lh.googleusercontent.com/FC6D6Iv6dbQlaZlTUcpVLjVxyclDfoOws84jG-J1ykvPdSm-lD6b9l6uuDemn476bQGsF_j7RBfnUy_64LRauQ=w240-h480",
    category: "lending",
    playStoreId: "com.sg.cashmartapp",
  },
  {
    id: "Finbro",
    name: "Finbro",
    iconUrl: "https://finbro.ph/icon.png",
    category: "lending",
  },
  {
    id: "UnaCash",
    name: "UnaCash",
    iconUrl: "https://advanceloans.ph/wp-content/uploads/2021/07/Una-Cash-download-app.png",
    category: "lending",
  },
  {
    id: "Pera247",
    name: "Pera247",
    iconUrl: "https://advanceloans.ph/wp-content/uploads/2022/06/pera247-philippines.png",
    category: "lending",
  },
  {
    id: "Plentina",
    name: "Plentina",
    iconUrl: "https://plentina.com/favicon.svg",
    category: "lending",
  },
  {
    id: "Crezu",
    name: "Crezu",
    iconUrl: "https://crezu.ph/apple-touch-icon.png",
    category: "lending",
  },
  {
    id: "Zaimoo",
    name: "Zaimoo",
    iconUrl: "https://loanapph.com/wp-content/uploads/2023/01/zaimoo.png",
    category: "lending",
  },
  {
    id: "SosCredit",
    name: "SosCredit",
    iconUrl: "https://www.soscredit.ph/favicon.png",
    category: "lending",
  },
  {
    id: "Mazilla",
    name: "Mazilla",
    iconUrl: "https://loanapph.com/wp-content/uploads/2023/01/mazilla.png",
    category: "lending",
  },
  {
    id: "Binixo",
    name: "Binixo",
    iconUrl: "https://binixo.ph/apple-touch-icon.png",
    category: "lending",
  },
  {
    id: "LoanRanger",
    name: "Loan Ranger",
    iconUrl: "https://advanceloans.ph/wp-content/uploads/2019/02/Loan-Ranger.png",
    category: "lending",
  },
  {
    id: "PesoQ",
    name: "PesoQ",
    iconUrl: "https://ploan.ph/images/logo/PesoQ2024120454.jpeg",
    category: "lending",
  },
  {
    id: "FastCash",
    name: "FastCash",
    iconUrl: "https://ploan.ph/images/logo/FastCash2024021417.png",
    category: "lending",
  },
  {
    id: "Robocash",
    name: "Robocash",
    iconUrl: "https://ploan.ph/images/logo/robocash14460.jpg",
    category: "lending",
  },
  {
    id: "HoneyLoan",
    name: "Honey Loan",
    iconUrl: "https://play-lh.googleusercontent.com/XpmPeQg714j35JiSXH3xDi2fcS008SgmfiaFYcj0XINIQ-RVFEOnSJZYU3Hpxo15Lls=w240-h480",
    category: "lending",
    playStoreId: "com.dyninno.mobileapp.philippines",
  },
  {
    id: "CreditNice",
    name: "Credit Nice",
    iconUrl: "https://ploan.ph/images/logo/creditnice2024042449.jpeg",
    category: "lending",
  },
  {
    id: "PERAMuning",
    name: "PERA Muning",
    iconUrl: "https://ploan.ph/images/logo/PERAMuning2025081217.jpeg",
    category: "lending",
  },
  {
    id: "PrimaLoan",
    name: "Prima Loan",
    iconUrl: "https://ploan.ph/images/logo/PrimaCash2024070121.jpeg",
    category: "lending",
  },
  {
    id: "BigLoan",
    name: "Big Loan",
    iconUrl: "https://bigloans.ph/apple-touch-icon.png",
    category: "lending",
  },
  {
    id: "FinMerkado",
    name: "FinMerkado",
    iconUrl: "https://play-lh.googleusercontent.com/iak07TCilD1FKWUQp7nsD4px-WQsgCzs858i825qobxWK_oYCkyvOCKiTFgUiL4f_fNOf59VAFKz2vwtj3icGQ=w240-h480",
    category: "lending",
    playStoreId: "ph.loanonline",
  },
  {
    id: "CashSpace",
    name: "CashSpace",
    iconUrl: "https://ploan.ph/images/logo/cashspace.jpg",
    category: "lending",
  },
  {
    id: "Credify",
    name: "Credify",
    iconUrl: "https://ploan.ph/images/logo/credify.jpg",
    category: "lending",
  },
  {
    id: "Creditify",
    name: "Creditify",
    iconUrl: "https://ploan.ph/images/logo/Creditify2024020915.jpeg",
    category: "lending",
  },
  {
    id: "Credy",
    name: "Credy",
    iconUrl: "https://ploan.ph/images/logo/Credy2024022910.jpeg",
    category: "lending",
  },
  {
    id: "PitaCash",
    name: "Pita Cash",
    iconUrl: "https://play-lh.googleusercontent.com/fKVBMJ6H0iIHdg7sX8A4C-mpBPXFKccgG4186b02MG6kOjV8HwqCWjI-duwQH4pNJw=w240-h480",
    category: "lending",
    playStoreId: "phl.pitacash.android",
  },
  {
    id: "PautangOnline",
    name: "Pautang Online",
    iconUrl: "https://ploan.ph/images/logo/PautangOnline2024012515.jpeg",
    category: "lending",
  },
  {
    id: "Pedicash",
    name: "Pedicash",
    iconUrl: "https://advanceloans.ph/wp-content/uploads/2022/06/pedicash-ph-300x300.png",
    category: "lending",
  },
  {
    id: "InstaCash",
    name: "Insta Cash",
    iconUrl: "https://play-lh.googleusercontent.com/KKbKTf483tl8BLN614dIqXweJPiaO5YYFmgTmGstY5tJpXf7if0a0isaX9-AOal0sFY=w240-h480",
    category: "lending",
    playStoreId: "com.insta.app",
  },
  {
    id: "CashMum",
    name: "CashMum",
    iconUrl: "https://play-lh.googleusercontent.com/XoA-4yPaboX4B1cnFmKLGxteIq4FDpZlFY9elR4tX8S6UoUklagpAxU_fPjQH4wfkA4=w240-h480",
    category: "lending",
    playStoreId: "com.myapp.cashmum",
  },
  {
    id: "PeraLoan",
    name: "Pera Loan",
    iconUrl: "https://peraloan7.com/images/favicon.ico",
    category: "lending",
  },
  {
    id: "Cash2Go",
    name: "Cash2Go",
    iconUrl: "https://play-lh.googleusercontent.com/VfEz0_Zi1_0q4wxVUXLDYYtlXolVttO77YHHdes1JMZYuGoOC8CvEo0vAXibF4RSdbA=w240-h480",
    category: "lending",
    playStoreId: "app.cash2go.cash_go_remake",
  },
  {
    id: "FinApps",
    name: "FinApps",
    iconUrl: "https://finapps.ph/wp-content/uploads/2023/08/cropped-fav-180x180.png",
    category: "lending",
  },
  {
    id: "FinanceSolution",
    name: "Finance Solution",
    iconUrl: "https://ploan.ph/images/logo/FinanceSolution2025101013.jpeg",
    category: "lending",
  },
  {
    id: "Finpug",
    name: "Finpug",
    iconUrl: "https://loanapph.com/wp-content/uploads/2024/09/finpug-logo.png",
    category: "lending",
  },
  {
    id: "XLKash",
    name: "XLKash",
    iconUrl: "https://play-lh.googleusercontent.com/dPmfP-kZOCZnDrj_z93RKbphdC2YMKci2A5mOOPeHpbCupMzxHPj-SUR5ISvBtXAsiiNhN_F4NtKKGd7TAlR=w240-h480",
    category: "lending",
    playStoreId: "com.xlkash.lending.loan",
  },
  {
    id: "LoanOnline",
    name: "Loan Online",
    iconUrl: "https://ploan.ph/images/logo/loanonline.jpg",
    category: "lending",
  },
  {
    id: "MegaPeso",
    name: "Mega Peso",
    iconUrl: "https://play-lh.googleusercontent.com/P5qRv7il9wQDA9FrD_uWUZQP8sKyTQ2L-kEsQZ7NueqIToaDHydXBSYoekd2UzCdciQ2tg-DV36KQWwytsHl=w240-h480",
    category: "lending",
    playStoreId: "com.cfiph.megapeso.loan",
  },
  {
    id: "LoadCash",
    name: "LoadCash",
    iconUrl: "https://play-lh.googleusercontent.com/dUAXiZi1157Q8w1t7IJbgD94VZcnvxJXRfC0TNvAKM5eCxISCEw6HGGqvw9uU0NZMYZivuenxI7YBX5Dz_9GVg=w240-h480",
    category: "lending",
    playStoreId: "com.take.cash",
  },
  {
    id: "Radiowealth",
    name: "Radiowealth Finance",
    iconUrl: "https://rfc.com.ph/wp-content/uploads/2024/03/RFC-Icon.png",
    category: "lending",
  },

  // --- Buy Now Pay Later ---
  {
    id: "BillEase",
    name: "BillEase",
    iconUrl: "https://play-lh.googleusercontent.com/J6PDdmzpkn_tzJrsvQhv2EA8l-AgEGnFEHF99gWJmeiQdAKmjjnGiDFuF2-m5YNOqyM=w240-h480",
    category: "bnpl",
    playStoreId: "ph.billeasev2.mobile",
  },
  {
    id: "Atome",
    name: "Atome",
    iconUrl: "https://play-lh.googleusercontent.com/g_V71OhzfekCWxFK9augJ1DqxTpc0XHNdc65eUpAHMY00fJFpjJWPG2urVgfvsSL1xw=w240-h480",
    category: "bnpl",
    playStoreId: "ph.atome.paylater",
  },
  {
    id: "Skyro",
    name: "Skyro",
    iconUrl: "https://play-lh.googleusercontent.com/uXOL4272QhI7RubLJ6mAp-CGqv8m_MPnCyeTJdbH69Zhzz9kBhySv5HqJbwJ0ylxrQ=w240-h480",
    category: "bnpl",
    playStoreId: "io.breezeventures.mb",
  },
  {
    id: "TendoPay",
    name: "Tendo by Tonik",
    iconUrl: "https://play-lh.googleusercontent.com/RF3W7a-muJO8XyIVLyZtWjF1IJf0Ov2A2_QEefWBOWOI63uobw5G6HWOD35sSOA7BcY=w240-h480",
    category: "bnpl",
    playStoreId: "ph.tendopay.app.android",
  },
  {
    id: "ShopeePay Later",
    name: "ShopeePay Later",
    iconUrl: "https://play-lh.googleusercontent.com/f7axBg1Vj1YvPC3ORm5sI5WmqzozUCZ-HeiK63oMhz3tIGkstPUTVKAgaXdoMWJdAmU=w240-h480",
    category: "bnpl",
    playStoreId: "com.shopee.ph",
  },
  {
    id: "GGives",
    name: "GGives",
    iconUrl: "https://play-lh.googleusercontent.com/zHWdvutw3clyMpCuvOBcxg_CwKtA0ANzk3a51nbsI715Ucj9cyj7ifI_35LAPr8JY-zo1QerhSe0QzeBADdvXYc=w240-h480",
    category: "bnpl",
    playStoreId: "com.globe.gcash.android",
  },
  {
    id: "GrabPayLater",
    name: "Grab PayLater",
    iconUrl: "https://play-lh.googleusercontent.com/lUb-D8akcMtF46SvrCnmLiH8-2BpfJB3GEubptM7jBXJZKPCrmw7YZH8WzX7Yt1WoA=w240-h480",
    category: "bnpl",
    playStoreId: "com.grabtaxi.passenger",
  },

  // --- E-wallets with Loan Products ---
  {
    id: "GLoan",
    name: "GLoan (GCash)",
    iconUrl: "https://play-lh.googleusercontent.com/zHWdvutw3clyMpCuvOBcxg_CwKtA0ANzk3a51nbsI715Ucj9cyj7ifI_35LAPr8JY-zo1QerhSe0QzeBADdvXYc=w240-h480",
    category: "ewallet",
    playStoreId: "com.globe.gcash.android",
  },
  {
    id: "Maya Credit",
    name: "Maya Credit",
    iconUrl: "https://play-lh.googleusercontent.com/fdQjxsIO8BTLaw796rQPZtLEnGEV8OJZJBJvl8dFfZLZcGf613W93z7y9dFAdDhvfqw=w240-h480",
    category: "ewallet",
    playStoreId: "com.paymaya",
  },

  // --- Banks & Digital Banks ---
  {
    id: "Tonik",
    name: "Tonik",
    iconUrl: "https://play-lh.googleusercontent.com/_iPBP61voJcopENuoeZF44sA_WG_E2C9dyzOHnb0O-SyVbbtNRq4zcRUvzF2SzP5idE=w240-h480",
    category: "bank",
    playStoreId: "com.tonik.mobile",
  },
  {
    id: "GoTyme",
    name: "GoTyme Bank",
    iconUrl: "https://play-lh.googleusercontent.com/GiLjujGyms4EnNst9_6vv2RrTsaQRiti6pnM4ph5QekhydI0qh6wLDkk94pLqoGUXmuEFaJXzDWDM7WQCnDx=w240-h480",
    category: "bank",
    playStoreId: "ph.com.gotyme",
  },
  {
    id: "CIMB",
    name: "CIMB Bank",
    iconUrl: "https://play-lh.googleusercontent.com/A5QGj9YsvNk_fYbprpb72-V4mfVqKv_JxFxr1ptwRS4AV1n7XeNHCJP_iipwXzr1itA=w240-h480",
    category: "bank",
    playStoreId: "com.cimbph.app2022",
  },
  {
    id: "MariBank",
    name: "MariBank (SeaBank)",
    iconUrl: "https://play-lh.googleusercontent.com/HB9J7cgdP_NnezblcswH-JMAuilEMnwqS5IHkxKxGw7oBxS6g_N7IYIHqLiHvi6D_whmu-qNy_JPyTdNQfXbVA=w240-h480",
    category: "bank",
    playStoreId: "ph.seabank.seabank",
  },
  {
    id: "UNOBank",
    name: "UNO Digital Bank",
    iconUrl: "https://play-lh.googleusercontent.com/gBpQOZmgLiyG9MP-ylqC5ke4QHyGKwKZRn8t366AHDKuxzVhPRpa6z4SN6bx_r4gEhk6=w240-h480",
    category: "bank",
    playStoreId: "com.iexceed.unoConsumerBanking",
  },
  {
    id: "DiskarTech",
    name: "DiskarTech (RCBC)",
    iconUrl: "https://play-lh.googleusercontent.com/eFi95XVSdlJsX959lAzv1wWxSUCyPIGkzUgaI2jdWoc9UrDFO3zydxZhU9JFYfFW-m8=w240-h480",
    category: "bank",
    playStoreId: "com.diskartech.mobile",
  },
  {
    id: "BPI",
    name: "BPI",
    iconUrl: "https://play-lh.googleusercontent.com/hph5YBvc0ZunCaPfZzI1HS0u3OstBmmPF0_OnqaChEih7O1wrsi-TlRg33AEt3FTero=w240-h480",
    category: "bank",
    playStoreId: "com.bpi.ng.app",
  },
  {
    id: "BDO",
    name: "BDO",
    iconUrl: "https://play-lh.googleusercontent.com/EpmjkFKW-WWfNqROBnTDs3Bd8V6Vsu2_Iexr0qI_95TgC6l79n5GoX2vVALloDNK58k=w240-h480",
    category: "bank",
    playStoreId: "ph.com.bdo.retail",
  },
  {
    id: "UnionBank",
    name: "UnionBank",
    iconUrl: "https://play-lh.googleusercontent.com/xeCakfcf3dDyUovyFd7CiAL_5LoS6W7n83f7jo4GqwFZBjhPR9MO9HuUgttmYPnOe7A=w240-h480",
    category: "bank",
    playStoreId: "com.unionbankph.online",
  },
  {
    id: "Landbank",
    name: "Landbank",
    iconUrl: "https://play-lh.googleusercontent.com/0EFKMDMvv8IhSBH5OEvsrYW8SnYK56e6aHbTvriJoaQWxUgfAbi3wE8yhy5NYb_RVw=w240-h480",
    category: "bank",
    playStoreId: "com.landbank.mobilebanking",
  },

  // --- Other (always last) ---
  {
    id: "Other",
    name: "Other",
    iconUrl: null,
    category: "lending",
  },
];

export const LENDING_APP_IDS = LENDING_APPS.map((a) => a.id);

const appMap = new Map(LENDING_APPS.map((a) => [a.id, a]));

export function getLendingApp(id: string): LendingApp | undefined {
  return appMap.get(id);
}

export function getLendingAppName(id: string, customName?: string): string {
  if (id === "Other") return customName || "Other";
  return appMap.get(id)?.name ?? id;
}

export function getLendingAppIcon(id: string): string | null {
  return appMap.get(id)?.iconUrl ?? null;
}
