package com.ssafy.jiguhero.oauthlogin.service.auth;

import java.net.URI;
import java.util.Optional;

import com.ssafy.jiguhero.data.entity.User;
import com.ssafy.jiguhero.data.repository.UserRepository;
import com.ssafy.jiguhero.oauthlogin.advice.assertThat.DefaultAssert;
import com.ssafy.jiguhero.oauthlogin.config.security.token.UserPrincipal;

import com.ssafy.jiguhero.oauthlogin.domain.entity.user.Provider;
import com.ssafy.jiguhero.oauthlogin.domain.entity.user.Role;
import com.ssafy.jiguhero.oauthlogin.domain.entity.user.Token;
import com.ssafy.jiguhero.oauthlogin.domain.mapping.TokenMapping;
import com.ssafy.jiguhero.oauthlogin.payload.request.auth.ChangePasswordRequest;
import com.ssafy.jiguhero.oauthlogin.payload.request.auth.SignInRequest;
import com.ssafy.jiguhero.oauthlogin.payload.request.auth.SignUpRequest;
import com.ssafy.jiguhero.oauthlogin.payload.request.auth.RefreshTokenRequest;
import com.ssafy.jiguhero.oauthlogin.payload.response.ApiResponse;
import com.ssafy.jiguhero.oauthlogin.payload.response.AuthResponse;
import com.ssafy.jiguhero.oauthlogin.payload.response.Message;
import com.ssafy.jiguhero.oauthlogin.repository.auth.TokenRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final CustomTokenProviderService customTokenProviderService;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;

    public ResponseEntity<?> whoAmI(UserPrincipal userPrincipal){
        Optional<User> user = userRepository.findById(userPrincipal.getId());
        DefaultAssert.isOptionalPresent(user);
        ApiResponse apiResponse = ApiResponse.builder().check(true).information(user.get()).build();

        return ResponseEntity.ok(apiResponse);
    }

    public ResponseEntity<?> delete(UserPrincipal userPrincipal){
        Optional<User> user = userRepository.findById(userPrincipal.getId());
        DefaultAssert.isTrue(user.isPresent(), "????????? ???????????? ????????????.");

        Optional<Token> token = tokenRepository.findByUserEmail(user.get().getEmail());
        DefaultAssert.isTrue(token.isPresent(), "????????? ???????????? ????????????.");

        userRepository.delete(user.get());
        tokenRepository.delete(token.get());

        ApiResponse apiResponse = ApiResponse.builder().check(true).information(Message.builder().message("?????? ?????????????????????.").build()).build();

        return ResponseEntity.ok(apiResponse);
    }

    public ResponseEntity<?> modify(UserPrincipal userPrincipal, ChangePasswordRequest passwordChangeRequest){
        Optional<User> user = userRepository.findById(userPrincipal.getId());
//        boolean passwordCheck = passwordEncoder.matches(passwordChangeRequest.getOldPassword(),user.get().getPassword());
        boolean passwordCheck = true;
        DefaultAssert.isTrue(passwordCheck, "????????? ???????????? ?????????.");

        boolean newPasswordCheck = passwordChangeRequest.getNewPassword().equals(passwordChangeRequest.getReNewPassword());
        DefaultAssert.isTrue(newPasswordCheck, "?????? ?????? ???????????? ?????? ???????????? ????????????.");


        passwordEncoder.encode(passwordChangeRequest.getNewPassword());

        return ResponseEntity.ok(true);
    }

    public ResponseEntity<?> signin(SignInRequest signInRequest){
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                signInRequest.getEmail(),
                signInRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        TokenMapping tokenMapping = customTokenProviderService.createToken(authentication);
        Token token = Token.builder()
                            .refreshToken(tokenMapping.getRefreshToken())
                            .userEmail(tokenMapping.getUserEmail())
                            .build();
        tokenRepository.save(token);
        AuthResponse authResponse = AuthResponse.builder().accessToken(tokenMapping.getAccessToken()).refreshToken(token.getRefreshToken()).build();
        
        return ResponseEntity.ok(authResponse);
    }

    public ResponseEntity<?> signup(SignUpRequest signUpRequest){
        DefaultAssert.isTrue(!userRepository.existsByEmail(signUpRequest.getEmail()), "?????? ???????????? ???????????? ????????????.");

        User user = User.builder()
                        .name(signUpRequest.getName())
                        .email(signUpRequest.getEmail())
                        .password(passwordEncoder.encode(signUpRequest.getPassword()))
                        .provider(Provider.local)
                        .role(Role.ADMIN)
                        .build();

        userRepository.save(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/auth/")
                .buildAndExpand(user.getUserId()).toUri();
        ApiResponse apiResponse = ApiResponse.builder().check(true).information(Message.builder().message("??????????????? ?????????????????????.").build()).build();

        return ResponseEntity.created(location).body(apiResponse);
    }

    public ResponseEntity<?> refresh(RefreshTokenRequest tokenRefreshRequest){
        //1??? ??????
        boolean checkValid = valid(tokenRefreshRequest.getRefreshToken());
        DefaultAssert.isAuthentication(checkValid);

        Optional<Token> token = tokenRepository.findByRefreshToken(tokenRefreshRequest.getRefreshToken());
        Authentication authentication = customTokenProviderService.getAuthenticationByEmail(token.get().getUserEmail());

        //4. refresh token ?????? ?????? ???????????? ??????.
        //?????? ????????? ??????
        TokenMapping tokenMapping;

        Long expirationTime = customTokenProviderService.getExpiration(tokenRefreshRequest.getRefreshToken());
        if(expirationTime > 0){
            tokenMapping = customTokenProviderService.refreshToken(authentication, token.get().getRefreshToken());
        }else{
            tokenMapping = customTokenProviderService.createToken(authentication);
        }

        Token updateToken = token.get().updateRefreshToken(tokenMapping.getRefreshToken());
        tokenRepository.save(updateToken);

        AuthResponse authResponse = AuthResponse.builder().accessToken(tokenMapping.getAccessToken()).refreshToken(updateToken.getRefreshToken()).build();

        return ResponseEntity.ok(authResponse);
    }

    public ResponseEntity<?> signout(RefreshTokenRequest tokenRefreshRequest){
        boolean checkValid = valid(tokenRefreshRequest.getRefreshToken());
        DefaultAssert.isAuthentication(checkValid);

        //4 token ????????? ????????????.
        Optional<Token> token = tokenRepository.findByRefreshToken(tokenRefreshRequest.getRefreshToken());
        tokenRepository.delete(token.get());
        ApiResponse apiResponse = ApiResponse.builder().check(true).information(Message.builder().message("???????????? ???????????????.").build()).build();

        return ResponseEntity.ok(apiResponse);
    }

    private boolean valid(String refreshToken){

        //1. ?????? ?????? ????????? ??????
        boolean validateCheck = customTokenProviderService.validateToken(refreshToken);
        DefaultAssert.isTrue(validateCheck, "Token ????????? ?????????????????????.");

        //2. refresh token ?????? ????????????.
        Optional<Token> token = tokenRepository.findByRefreshToken(refreshToken);
        DefaultAssert.isTrue(token.isPresent(), "?????? ????????? ???????????????.");

        //3. email ?????? ?????? ???????????? ????????????
        Authentication authentication = customTokenProviderService.getAuthenticationByEmail(token.get().getUserEmail());
        DefaultAssert.isTrue(token.get().getUserEmail().equals(authentication.getName()), "????????? ????????? ?????????????????????.");

        return true;
    }


}
