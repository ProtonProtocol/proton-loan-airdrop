<template>
    <div class="flex bg-gray-900">
        <div class="hidden sm:flex justify-center items-center bg-gray-900 h-full w-1/2">
            <img
                class="sm:p-12"
                src="@/assets/banner.png"
                alt="Proton Wallet"
            />
            <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 mix-blend-multiply" />
        </div>
        <div class="flex justify-center items-center mx-auto w-full sm:w-1/2 p-12">
            <div class="max-w-md">
                <h2 class="text-base font-semibold uppercase tracking-wider text-gray-300">
                    Easy to use wallet
                </h2>
                <p class="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Ready to get started?
                </p>
                <p class="mt-3 text-lg text-gray-300">
                    Download Proton Wallet today to create an account and use the natively built-in cross-chain bridge and swap functionality.
                </p>
                <div class="mt-8">
                    <div class="flex rounded-md shadow">
                        <a
                            href="https://apps.apple.com/us/app/proton-wallet/id1516536231"
                            id="iOS"
                        >
                            <img
                                alt="Download on the App Store"
                                src="https://protonchain.com/static/719169dd7ea5089ae32be4dcae845078/DownloadApple.svg"
                                class="walletstyled__DownloadImg-sc-1cxljw3-4 gLfAqV"
                            >
                        </a>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.metallicus.protonwallet"
                            id="Android"
                            class="ml-3"
                        >
                            <img
                                alt="Get it on Google Play"
                                src="https://protonchain.com/static/b36e63520d1db11b0ce4989b73866ae0/DownloadGoogleEN.svg"
                                class="walletstyled__DownloadImg-sc-1cxljw3-4 gLfAqV"
                            >
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
