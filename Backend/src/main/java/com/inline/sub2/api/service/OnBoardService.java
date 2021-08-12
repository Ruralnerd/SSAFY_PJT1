package com.inline.sub2.api.service;

import com.inline.sub2.api.dto.UserRegistDto;
import com.inline.sub2.db.entity.OnBoardEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface OnBoardService {
    @Transactional(rollbackFor = Exception.class)
    OnBoardEntity registUserOnboard(UserRegistDto user);
    UserRegistDto clickEmail(String email);
    void deleteUserOnboard(String email);
    List<OnBoardEntity> getOnboardUsers(Long officeId);
}
